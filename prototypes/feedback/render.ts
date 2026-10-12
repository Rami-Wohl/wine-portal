import {
  EMPTY_VALUES,
  KINDS,
  LIMITS,
  kinds,
  states,
  text,
  type FormErrors,
  type FormValues,
  type Kind,
  type Locale,
  type State,
} from "./copy";

export type Scope = "block" | "page" | "general";
export interface View {
  locale: Locale;
  scope: Scope;
  kind?: Kind;
  screen?: State | "article";
  values?: FormValues;
  errors?: FormErrors;
}

export const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!,
  );

export function href(
  view: View,
  options: { screen?: View["screen"]; kind?: Kind; scope?: Scope; locale?: Locale } = {},
) {
  const locale = options.locale ?? view.locale;
  const params = new URLSearchParams({ scope: options.scope ?? view.scope });
  if (options.screen) params.set("screen", options.screen);
  if (options.kind) params.set("kind", options.kind);
  return `${locale === "en" ? "/en" : "/"}?${params}`;
}

export function render(view: View) {
  const { locale, kind, screen, scope } = view;
  const t = (nl: string, en: string) => text(locale, nl, en);
  const values = view.values ?? EMPTY_VALUES;
  const errors = view.errors ?? {};
  const isReply = screen === "needs_info";
  const hasForm = Boolean(kind) || isReply || !screen;
  const field = (
    name: keyof FormValues,
    label: string,
    hint: string,
    required = false,
    max = LIMITS.bodyMax,
  ) => `
    <div class="field">
      <label for="${name}">${label}${required ? "" : ` <span class="optional">${t("optioneel", "optional")}</span>`}</label>
      <p class="field-hint" id="${name}-hint">${hint}</p>
      <textarea id="${name}" name="${name}" rows="${name === "body" ? 5 : 2}" maxlength="${max}" ${required ? "required" : ""}
        ${name === "body" ? `minlength="${LIMITS.bodyMin}"` : ""} aria-describedby="${name}-hint${errors[name] ? ` ${name}-error` : ""}"
        ${errors[name] ? 'aria-invalid="true"' : ""}>${escape(values[name])}</textarea>
      ${errors[name] ? `<p class="field-error" id="${name}-error">${escape(errors[name]!)}</p>` : ""}
    </div>`;
  const hiddenValues = Object.entries(values)
    .map(([name, value]) => `<input type="hidden" name="${name}" value="${escape(value)}">`)
    .join("");
  const errorSummary = Object.keys(errors).length
    ? `<div class="error-summary" id="errors" tabindex="-1"><h2>${t("Controleer je invoer", "Check your input")}</h2><ul>${Object.entries(
        errors,
      )
        .map(
          ([name, message]) =>
            `<li>${name === "form" ? escape(message!) : `<a href="#${name}">${escape(message!)}</a>`}</li>`,
        )
        .join("")}</ul></div>`
    : "";
  const context = `<aside class="context" aria-label="${t("Waar je melding over gaat", "What your report is about")}">
    <p class="eyebrow">${t("Je melding gaat over", "Your report concerns")}</p>
    <p class="context-title">${scope === "general" ? "Oenocademy" : t("Een voorbeeldpagina", "A sample page")}</p>
    ${scope === "block" ? `<p>${t("Sectie", "Section")}: <strong>${t("Een voorbeeldsectie", "A sample section")}</strong></p>` : `<p>${scope === "general" ? t("Een idee voor het platform", "An idea for the platform") : t("De pagina als geheel", "The page as a whole")}</p>`}
    <p>${t("Je leest in het Nederlands", "You are reading in English")}</p>
    <a href="${escape(href(view, { screen: "article" }))}">${t("Bekijk de voorbeeldpagina", "View the sample page")}</a>
    <hr><p>${t("De context wordt automatisch toegevoegd. Vermeld geen persoonlijke gegevens in je toelichting.", "The context is added automatically. Please keep personal information out of your explanation.")}</p>
  </aside>`;
  let title: string;
  let content: string;
  if (screen === "article") {
    title = t("Een voorbeeldpagina", "A sample page");
    content = `<p class="eyebrow">${t("Lezen en verbeteren", "Read and improve")}</p><h1 id="heading" tabindex="-1">${title}</h1>
      <p class="lead">${t("Een rustige instap, direct naast de uitleg die je leest.", "A quiet way to contribute, beside the explanation you are reading.")}</p>
      <section class="sample-block" tabindex="0" aria-labelledby="sample-heading"><h2 id="sample-heading">${t("Een voorbeeldsectie", "A sample section")}</h2>
        <p>${t("Deze tekst is uitsluitend bedoeld om het meldformulier te beoordelen. Hij bevat geen wijnclaim en hoort niet bij de gepubliceerde kennisbank.", "This text is only for reviewing the reporting form. It contains no wine claim and is not part of the published knowledge base.")}</p>
        <a class="block-action" href="${escape(href(view, { scope: "block" }))}">${t("Klopt dit niet?", "Something wrong?")} <span aria-hidden="true">↗</span></a>
      </section><div class="actions"><a href="${escape(href(view, { scope: "page" }))}">${t("Iets over deze pagina melden", "Report something about this page")}</a><a href="${escape(href(view, { scope: "general", kind: "suggestion" }))}">${t("Een idee voor Oenocademy delen", "Share an idea for Oenocademy")}</a></div>`;
  } else if (isReply) {
    title = states.needs_info[locale][0];
    content = `<p class="eyebrow">${t("Je melding", "Your report")}</p><h1 id="heading" tabindex="-1">${title}</h1><p class="lead">${states.needs_info[locale][1]}</p>${errorSummary}
      <form id="feedback-form" method="post" action="${escape(href(view, { screen: "needs_info" }))}#errors" novalidate>
        <input type="hidden" name="intent" value="reply">${field("body", t("Je aanvulling", "Your additional information"), t("Beschrijf de aanvulling in 30–4000 tekens.", "Describe the additional information in 30–4000 characters."), true)}
        <button type="submit">${states.needs_info[locale][2]} <span aria-hidden="true">→</span></button>
      </form>`;
  } else if (screen) {
    const [heading, explanation, action] = states[screen][locale];
    title = heading;
    const destination =
      screen === "received"
        ? "detail"
        : screen === "accepted" || screen === "duplicate"
          ? "work"
          : screen === "abuse"
            ? "appeal"
            : screen === "unavailable" || screen === "login"
              ? undefined
              : "article";
    content = `<p class="eyebrow">${t("Je melding", "Your report")}</p><h1 id="heading" tabindex="-1">${heading}</h1><p class="lead">${explanation}</p>
      <a class="button" href="${escape(href(view, { screen: destination }))}">${action} <span aria-hidden="true">→</span></a>`;
  } else if (kind) {
    const copy = kinds[kind][locale];
    title = copy.title;
    content = `<p class="eyebrow">${t("Stap 2 van 2 · Licht toe", "Step 2 of 2 · Add detail")}</p><h1 id="heading" tabindex="-1">${copy.title}</h1>
      <p class="lead">${copy.detail}</p>${errorSummary}
      <form id="feedback-form" method="post" action="${escape(href(view, { kind }))}#errors" novalidate>
        <input type="hidden" name="intent" value="submit">
        ${field("body", copy.question, `${copy.hint} ${t("30–4000 tekens.", "30–4000 characters.")}`, true)}
        ${field("source", t("Bron of referentie", "Source or reference"), kind === "factual" ? t("Een link of bibliografische verwijzing is nodig om een feitelijke claim te onderzoeken. Bijvoorbeeld: titel, auteur en pagina. Een bron wordt door een redacteur beoordeeld.", "A link or bibliographic reference is needed to investigate a factual claim. For example: title, author and page. An editor will assess the reference.") : t("Een link of referentie mag, maar is voor deze melding niet nodig.", "You may add a link or reference, but it is not required for this report."), kind === "factual", LIMITS.sourceMax)}
        <details class="suggested" ${values.suggestion || errors.suggestion ? "open" : ""}><summary>${t("Wil je een andere formulering voorstellen?", "Would you like to suggest different wording?")}</summary>
          ${field("suggestion", t("Voorgestelde formulering", "Suggested wording"), t("Je voorstel wordt door een redacteur bekeken. Maximaal 2000 tekens.", "An editor will review your suggestion. Up to 2000 characters."), false, LIMITS.suggestionMax)}</details>
        <p class="form-note">${t("We gebruiken je melding om de inhoud of het platform te verbeteren. Meldingen zijn privé en verschijnen niet als reactie op de pagina. Vermeld geen persoonlijke gegevens in je toelichting.", "We use reports to improve the content or the platform. Reports are private and do not appear as comments on the page. Please keep personal information out of your explanation.")}</p>
        <div class="actions"><button type="submit">${t("Melding sturen", "Send report")} <span aria-hidden="true">→</span></button>
          <button class="text-button" type="submit" formnovalidate formaction="${escape(href(view))}" name="change_kind" value="yes">${t("Andere soort kiezen", "Choose a different type")}</button></div>
      </form>`;
  } else {
    title =
      scope === "general"
        ? t("Help Oenocademy te verbeteren", "Help improve Oenocademy")
        : t("Help de uitleg beter te maken", "Help improve the explanation");
    content = `<p class="eyebrow">${t("Stap 1 van 2 · Kies wat er speelt", "Step 1 of 2 · Choose a type")}</p><h1 id="heading" tabindex="-1">${title}</h1>
      <p class="lead">${t("Wat wil je ons laten weten? Kies de omschrijving die het beste past.", "What would you like to tell us? Choose the description that fits best.")}</p>${errorSummary}
      <form id="feedback-form" method="post" action="${escape(href(view))}"><input type="hidden" name="intent" value="choose">${hiddenValues}
        <div class="kind-list">${KINDS.map((item) => `<button class="kind-choice" type="submit" name="kind" value="${item}"><span><strong>${kinds[item][locale].title}</strong><span>${kinds[item][locale].detail}</span></span><span class="choice-arrow" aria-hidden="true">→</span></button>`).join("")}</div>
      </form>`;
  }
  const otherLocale = locale === "nl" ? "en" : "nl";
  const languageLink = href(view, { locale: otherLocale, kind, screen });
  const language = hasForm
    ? `<button class="language text-button" type="submit" form="feedback-form" formaction="${escape(languageLink)}" formnovalidate name="switch_language" value="yes" lang="${otherLocale}">${otherLocale === "nl" ? "Nederlands" : "English"}</button>`
    : `<a class="language" href="${escape(languageLink)}" lang="${otherLocale}" hreflang="${otherLocale}">${otherLocale === "nl" ? "Nederlands" : "English"}</a>`;
  return `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${Object.keys(errors).length ? t("Controleer je invoer", "Check your input") + " · " : ""}${escape(title)} · Oenocademy</title><link rel="stylesheet" href="/tokens.css"><link rel="stylesheet" href="/prototype.css"></head>
    <body><a class="skip-link" href="#heading">${t("Ga naar de inhoud", "Skip to content")}</a>
      <div class="prototype-notice">${t("Lokale ontwerpproef · Gebruik voorbeeldtekst. Er wordt niets opgeslagen of gemaild.", "Local design prototype · Use sample text. Nothing is saved or emailed.")}</div>
      <header><a class="brand" href="${locale === "en" ? "/en" : "/"}">Oenocademy<span>${t("Kennis die verder groeit", "Knowledge that keeps growing")}</span></a><nav aria-label="${t("Ontwerpproef", "Design prototype")}"><a href="${escape(href(view, { screen: "article" }))}">${t("Voorbeeldpagina", "Sample page")}</a>${language}</nav></header>
      <main class="layout${screen === "article" ? " article" : ""}">${screen === "article" ? "" : context}<div class="content">${content}</div></main>
      <footer><details class="review-menu"><summary>${t("Ontwerpstates bekijken", "Preview design states")}</summary><ul>${Object.entries(
        states,
      )
        .map(
          ([key, value]) =>
            `<li><a href="${escape(href(view, { screen: key as State }))}">${value[locale][0]}</a></li>`,
        )
        .join(
          "",
        )}</ul><p>${t("Deze voorbeelden tonen toekomstige uitkomsten; er bestaan hier geen accounts, meldingen of tickets.", "These examples show future outcomes; there are no accounts, reports or work items here.")}</p></details></footer>
    </body></html>`;
}
