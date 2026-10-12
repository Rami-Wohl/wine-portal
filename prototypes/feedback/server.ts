import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  EMPTY_VALUES,
  KINDS,
  LIMITS,
  states,
  text,
  type FormErrors,
  type FormValues,
  type Locale,
} from "./copy";
import { href, render, type View } from "./render";

// Local throwaway design server. No database, auth, email, body logging or persistence.
const port = Number(process.env.FEEDBACK_PROTOTYPE_PORT ?? 3102);
const assets = new Map([
  ["/tokens.css", readFileSync(path.resolve(__dirname, "../../src/styles/tokens.css"), "utf8")],
  ["/prototype.css", readFileSync(path.resolve(__dirname, "prototype.css"), "utf8")],
]);
const schema = z.object({
  body: z.string().trim().min(LIMITS.bodyMin).max(LIMITS.bodyMax),
  source: z.string().trim().max(LIMITS.sourceMax),
  suggestion: z.string().trim().max(LIMITS.suggestionMax),
});
const server = createServer(async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; style-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  );
  // Preserve Origin on same-origin native POSTs; never send a cross-origin referrer.
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
  const host = req.headers.host;
  if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) {
    res.writeHead(403).end();
    return;
  }
  const url = new URL(req.url ?? "/", `http://${host}`);
  if (req.method === "GET" && assets.has(url.pathname)) {
    res.setHeader("Content-Type", "text/css; charset=utf-8");
    res.end(assets.get(url.pathname));
    return;
  }
  if (!["/", "/en"].includes(url.pathname)) {
    res.writeHead(404).end();
    return;
  }
  const locale: Locale = url.pathname === "/en" ? "en" : "nl";
  const t = (nl: string, en: string) => text(locale, nl, en);
  const parsedKind = z.enum(KINDS).safeParse(url.searchParams.get("kind"));
  const parsedScreen = z
    .enum(["article", ...Object.keys(states)])
    .safeParse(url.searchParams.get("screen"));
  const parsedScope = z
    .enum(["block", "page", "general"])
    .safeParse(url.searchParams.get("scope") ?? "block");
  const view: View = {
    locale,
    kind: parsedKind.success ? parsedKind.data : undefined,
    screen: parsedScreen.success ? (parsedScreen.data as View["screen"]) : undefined,
    scope: parsedScope.success ? parsedScope.data : "block",
  };
  const send = (status: number, model: View) => {
    res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
    res.end(render(model));
  };
  if (req.method === "GET") {
    send(200, view);
    return;
  }
  if (req.method !== "POST") {
    res.writeHead(405, { Allow: "GET, POST" }).end();
    return;
  }
  if (
    req.headers.origin !== `http://${host}` ||
    !req.headers["content-type"]?.startsWith("application/x-www-form-urlencoded")
  ) {
    send(403, {
      ...view,
      errors: {
        form: t(
          "Open het formulier opnieuw en probeer het nog eens.",
          "Open the form again and try once more.",
        ),
      },
    });
    req.resume();
    return;
  }
  try {
    const chunks: Buffer[] = [];
    let bytes = 0;
    await new Promise<void>((resolve, reject) => {
      req.on("data", (chunk: Buffer) => {
        bytes += chunk.length;
        if (bytes <= LIMITS.requestBytes) chunks.push(chunk);
      });
      req.on("end", resolve);
      req.on("error", reject);
    });
    if (bytes > LIMITS.requestBytes) {
      send(413, {
        ...view,
        errors: {
          form: t(
            "De invoer is te groot. Kort de tekst in en probeer opnieuw.",
            "The input is too large. Shorten the text and try again.",
          ),
        },
      });
      return;
    }
    const data = new URLSearchParams(Buffer.concat(chunks).toString("utf8"));
    const values: FormValues = {
      ...EMPTY_VALUES,
      ...Object.fromEntries(
        ["body", "source", "suggestion"].map((key) => [key, data.get(key) ?? ""]),
      ),
    };
    if (data.has("switch_language") || data.has("change_kind")) {
      send(200, { ...view, values, kind: data.has("change_kind") ? undefined : view.kind });
      return;
    }
    if (data.get("intent") === "choose") {
      const selected = z.enum(KINDS).safeParse(data.get("kind"));
      send(selected.success ? 200 : 422, {
        ...view,
        kind: selected.success ? selected.data : undefined,
        values,
      });
      return;
    }
    const isReply = view.screen === "needs_info";
    if (!view.kind && !isReply) {
      send(422, {
        ...view,
        values,
        errors: {
          form: t("Kies eerst wat je wilt melden.", "First choose what you would like to report."),
        },
      });
      return;
    }
    const result = schema.safeParse(values);
    const errors: FormErrors = {};
    if (!result.success)
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FormValues;
        errors[key] =
          key === "body"
            ? t(
                "Beschrijf je melding in 30–4000 tekens.",
                "Describe your report in 30–4000 characters.",
              )
            : t(
                "Gebruik maximaal 2000 tekens voor dit veld.",
                "Use no more than 2000 characters for this field.",
              );
      }
    if (view.kind === "factual" && !values.source.trim())
      errors.source = t(
        "Voeg een bron of bibliografische referentie toe.",
        "Add a source or bibliographic reference.",
      );
    if (
      (Object.values(values)
        .join(" ")
        .match(/https?:\/\/|www\./gi)?.length ?? 0) > LIMITS.links
    )
      errors.form = t(
        "Gebruik maximaal vijf links in je melding.",
        "Use no more than five links in your report.",
      );
    if (Object.keys(errors).length) {
      send(422, { ...view, values, errors });
      return;
    }
    // POST/redirect/GET carries no input in the URL and retains no report record.
    res
      .writeHead(303, {
        Location: `${href(view, { screen: isReply ? "replied" : "received" })}#heading`,
      })
      .end();
  } catch {
    if (!res.headersSent)
      send(400, {
        ...view,
        errors: {
          form: t(
            "De invoer kon niet worden gelezen. Probeer opnieuw.",
            "The input could not be read. Please try again.",
          ),
        },
      });
  }
});
server.requestTimeout = 10_000;
server.listen(port, "127.0.0.1", () => console.log(`Feedback prototype: http://127.0.0.1:${port}`));
