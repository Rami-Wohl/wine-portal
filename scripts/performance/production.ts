import { spawn, execFileSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { get } from "node:http";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { gunzipSync, gzipSync } from "node:zlib";
import { filesUnder } from "./fixtures";
import { percentile, SEARCH_CASES } from "./search-worker";
import type { MediaAsset } from "../../src/content/model";

export async function measureBuildArtifacts(root: string) {
  const nextDirectory = path.join(root, ".next");
  const files = await filesUnder(nextDirectory);
  const serverChunks = await Promise.all(
    files
      .filter((file) => /server\/chunks\/.*\.js$/.test(file))
      .map(async (file) => ({ file: path.relative(root, file), bytes: (await stat(file)).size })),
  );
  const clientChunks = await Promise.all(
    files
      .filter((file) => /static\/chunks\/.*\.js$/.test(file))
      .map(async (file) => {
        const bytes = await readFile(file);
        return {
          file: path.relative(root, file),
          bytes: bytes.length,
          gzipBytes: gzipSync(bytes).length,
        };
      }),
  );
  const traces = files.filter((file) => file.endsWith(".nft.json"));
  const commonTrace = path.join(nextDirectory, "next-server.js.nft.json");
  const traceFiles = async (filename: string) => {
    const trace = JSON.parse(await readFile(filename, "utf8")) as { files: string[] };
    return trace.files.map((file) => path.resolve(path.dirname(filename), file));
  };
  const common = await traceFiles(commonTrace);
  const bundleFile = path.join(root, "src/generated/content/knowledge-base.json");
  const searchTrace = path.join(nextDirectory, "server/app/[lang]/search/page.js.nft.json");
  if (!(await traceFiles(searchTrace)).includes(bundleFile)) {
    throw new Error("The dynamic search deployment trace is missing its generated data file.");
  }
  const closures = await Promise.all(
    traces
      .filter((file) => file.includes("/server/app/"))
      .map(async (filename) => {
        const uniqueFiles = new Set([
          ...common,
          ...(await traceFiles(filename)),
          filename.slice(0, -".nft.json".length),
        ]);
        const sizes = await Promise.all(
          [...uniqueFiles].map(async (file) => (await stat(file)).size),
        );
        return {
          route: path.relative(nextDirectory, filename),
          bytes: sizes.reduce((sum, value) => sum + value, 0),
          files: uniqueFiles.size,
        };
      }),
  );
  const manifest = JSON.parse(
    await readFile(path.join(nextDirectory, "prerender-manifest.json"), "utf8"),
  );
  return {
    generatedBundleTraced: true,
    prerenderedRoutes: Object.keys(manifest.routes).length,
    largestServerChunks: serverChunks.sort((a, b) => b.bytes - a.bytes).slice(0, 3),
    clientChunks: {
      count: clientChunks.length,
      bytes: clientChunks.reduce((sum, file) => sum + file.bytes, 0),
      gzipBytes: clientChunks.reduce((sum, file) => sum + file.gzipBytes, 0),
    },
    largestTracedClosures: closures.sort((a, b) => b.bytes - a.bytes).slice(0, 3),
  };
}

function request(url: string, accept = "text/html") {
  return new Promise<{
    ms: number;
    status: number;
    wireBytes: number;
    body: Buffer;
    contentType: string;
  }>((resolve, reject) => {
    const started = performance.now();
    const req = get(
      url,
      { headers: { "Accept-Encoding": "gzip", Accept: accept }, timeout: 30_000 },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const wire = Buffer.concat(chunks);
          const body = response.headers["content-encoding"] === "gzip" ? gunzipSync(wire) : wire;
          resolve({
            ms: performance.now() - started,
            status: response.statusCode ?? 0,
            wireBytes: wire.length,
            body,
            contentType: response.headers["content-type"] ?? "",
          });
        });
        response.on("error", reject);
      },
    );
    req.on("timeout", () => req.destroy(new Error(`Request timeout: ${url}`)));
    req.on("error", reject);
  });
}

function rssBytes(pid: number) {
  return (
    Number(execFileSync("ps", ["-o", "rss=", "-p", String(pid)], { encoding: "utf8" }).trim()) *
    1024
  );
}

export async function measureServer(
  root: string,
  port: number,
  assets: MediaAsset[],
  measureImages: boolean,
) {
  const started = performance.now();
  const server = spawn(
    process.execPath,
    [
      path.join(root, "node_modules/next/dist/bin/next"),
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(port),
    ],
    { cwd: root, stdio: ["ignore", "pipe", "pipe"] },
  );
  let log = "";
  const origin = `http://127.0.0.1:${port}`;
  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Server readiness timed out: ${log}`));
      }, 30_000);
      const onData = (chunk: Buffer) => {
        log += chunk.toString();
        if (log.includes("Ready in")) {
          clearTimeout(timer);
          resolve();
        }
      };
      server.stdout.on("data", onData);
      server.stderr.on("data", onData);
      server.once("error", (error) => {
        clearTimeout(timer);
        reject(error);
      });
      server.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`Server exited ${code}: ${log}`));
      });
    });
    const readyMs = performance.now() - started;
    const first = await request(`${origin}/search?q=nonexistent-query-82719`);
    if (first.status !== 200) throw new Error(`First search returned ${first.status}`);
    const cold = {
      readyMs,
      firstRequestMs: first.ms,
      processToFirstResponseMs: performance.now() - started,
      rssBytes: rssBytes(server.pid!),
    };
    const firstEnglish = await request(`${origin}/en/search?q=nonexistent-query-82719`);
    if (firstEnglish.status !== 200)
      throw new Error(`English search returned ${firstEnglish.status}`);
    const searches = [];
    for (const locale of ["nl", "en"]) {
      for (const sample of SEARCH_CASES.filter(({ query }) => query)) {
        const times = [];
        let wireBytes = 0;
        for (let round = 0; round < 3; round += 1) {
          const params = new URLSearchParams({ q: sample.query, type: sample.type });
          const response = await request(
            `${origin}${locale === "en" ? "/en" : ""}/search?${params}`,
          );
          if (response.status !== 200) throw new Error(`Search returned ${response.status}`);
          times.push(response.ms);
          wireBytes = response.wireBytes;
        }
        searches.push({
          ...sample,
          locale,
          p50Ms: percentile(times, 0.5),
          p95Ms: percentile(times, 0.95),
          samplesMs: times,
          wireBytes,
        });
      }
    }
    const page = await request(`${origin}/concepts/wine-perception-and-development`);
    if (page.status !== 200) throw new Error(`Article returned ${page.status}`);
    const resourcePaths = [
      ...new Set(page.body.toString().match(/\/_next\/static\/[^"\s<>]+\.(?:js|css)/g)),
    ];
    const resources = [];
    for (const resource of resourcePaths) {
      const response = await request(`${origin}${resource}`);
      if (response.status !== 200)
        throw new Error(`Resource returned ${response.status}: ${resource}`);
      resources.push({ path: resource, wireBytes: response.wireBytes });
    }
    const images = [];
    if (measureImages) {
      const illustration = assets.find(({ id }) => id.includes("wine-perception"));
      const photo = assets.find(
        ({ role, storage_key }) => role === "representative" && /\.jpe?g$/i.test(storage_key),
      );
      for (const asset of [illustration, photo].filter((asset): asset is MediaAsset =>
        Boolean(asset),
      )) {
        for (const width of [828, 1920]) {
          const params = new URLSearchParams({
            url: `/media/${asset.storage_key}`,
            w: String(width),
            q: "75",
          });
          const response = await request(`${origin}/_next/image?${params}`, "image/webp");
          if (response.status !== 200)
            throw new Error(`Image returned ${response.status}: ${asset.storage_key}`);
          const warm = await request(`${origin}/_next/image?${params}`, "image/webp");
          images.push({
            id: asset.id,
            width,
            rawBytes: (await stat(path.join(root, "public/media", asset.storage_key))).size,
            wireBytes: response.wireBytes,
            contentType: response.contentType,
            firstMs: response.ms,
            warmMs: warm.ms,
          });
        }
      }
    }
    return {
      cold,
      firstEnglishRequestMs: firstEnglish.ms,
      searches,
      warmRssBytes: rssBytes(server.pid!),
      article: {
        htmlWireBytes: page.wireBytes,
        htmlDecodedBytes: page.body.length,
        resources,
        jsWireBytes: resources
          .filter(({ path: file }) => file.endsWith(".js"))
          .reduce((sum, file) => sum + file.wireBytes, 0),
      },
      images,
    };
  } finally {
    if (server.exitCode === null) {
      const stopped = new Promise<void>((resolve) => server.once("exit", () => resolve()));
      server.kill("SIGTERM");
      const timer = setTimeout(() => server.kill("SIGKILL"), 5_000);
      await stopped;
      clearTimeout(timer);
    }
  }
}
