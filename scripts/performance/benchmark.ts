import { spawn, execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpus, platform, release, tmpdir, totalmem } from "node:os";
import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";
import { pathToFileURL } from "node:url";
import { brotliCompressSync, gzipSync } from "node:zlib";
import ts from "typescript";
import type { GeneratedKnowledgeBase } from "../../src/content/model";
import { addApplicationFixture, createCorpusFixture, filesUnder } from "./fixtures";
import { measureBuildArtifacts, measureServer } from "./production";
import { evaluateBudgets, type BudgetMeasurements, type ScaleMeasurement } from "./budgets";
import type { SearchMeasurement } from "./search-worker";
import type { ContentBuildMeasurement } from "./build-worker";

async function command(
  args: string[],
  cwd: string,
  logFile: string,
  executable = process.execPath,
): Promise<{ stdout: string; elapsedMs: number }> {
  const started = performance.now();
  const child = spawn(executable, args, {
    cwd,
    env: {
      ...process.env,
      TSX_TSCONFIG_PATH: path.join(process.cwd(), "tsconfig.json"),
      NEXT_TELEMETRY_DISABLED: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "",
    stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  const code = await new Promise<number | null>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", resolve);
  });
  await writeFile(logFile, `${stdout}\n${stderr}`);
  if (code !== 0) throw new Error(`Command failed (${code}); see ${logFile}`);
  return { stdout, elapsedMs: performance.now() - started };
}

async function inventory(repository: string) {
  const mediaFiles = await filesUnder(path.join(repository, "public/media"));
  const media = await Promise.all(
    mediaFiles.map(async (file) => ({
      key: path.relative(path.join(repository, "public/media"), file),
      bytes: (await stat(file)).size,
    })),
  );
  const gitObjectDirectory = execFileSync("git", ["rev-parse", "--git-path", "objects"], {
    cwd: repository,
    encoding: "utf8",
  }).trim();
  const gitFiles = await filesUnder(path.resolve(repository, gitObjectDirectory));
  const gitObjectBytes = (
    await Promise.all(gitFiles.map(async (file) => (await stat(file)).size))
  ).reduce((sum, size) => sum + size, 0);
  const tracked = new Set(
    execFileSync("git", ["ls-files", "-z", "public/media"], { cwd: repository, encoding: "utf8" })
      .split("\0")
      .filter(Boolean),
  );
  return {
    media: {
      files: media.length,
      bytes: media.reduce((sum, file) => sum + file.bytes, 0),
      trackedBytes: media
        .filter(({ key }) => tracked.has(`public/media/${key}`))
        .reduce((sum, file) => sum + file.bytes, 0),
      over2MiB: media.filter(({ bytes }) => bytes > 2 * 1024 ** 2).length,
      largest: media.sort((a, b) => b.bytes - a.bytes).slice(0, 5),
    },
    gitObjectBytes,
  };
}

async function referenceModule(repository: string, output: string, revision: string) {
  const commit = execFileSync(
    "git",
    ["rev-parse", "--verify", "--end-of-options", `${revision}^{commit}`],
    { cwd: repository, encoding: "utf8" },
  ).trim();
  const original = execFileSync("git", ["show", `${commit}:src/content/search.ts`], {
    cwd: repository,
    encoding: "utf8",
  });
  const javascript = ts.transpileModule(original, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const relocated = javascript.replace(
    /from (["'])\.\/([^"']+)\1/g,
    (_match, _quote, file) =>
      `from ${JSON.stringify(pathToFileURL(path.join(repository, "src/content", `${file}.ts`)).href)}`,
  );
  const filename = path.join(output, "reference-search.mjs");
  await writeFile(filename, relocated);
  return filename;
}

async function main() {
  const arguments_ = process.argv.slice(2);
  const allowed = ["--production", "--clone", "--keep-fixtures", "--enforce", "--help"];
  for (const argument of arguments_) {
    if (!allowed.includes(argument) && !/^--(?:output|scales|reference|check)=.+$/.test(argument))
      throw new Error(`Unknown option: ${argument}`);
  }
  if (arguments_.includes("--help")) {
    console.log(
      "npm run benchmark -- [--production] [--clone] [--scales=1,3,8] [--reference=<git-ref>] [--output=<new-directory-outside-repo>] [--keep-fixtures] [--enforce] | --check=<results.json>",
    );
    return;
  }
  const repository = process.cwd();
  const option = (name: string) =>
    arguments_.find((argument) => argument.startsWith(`--${name}=`))?.slice(name.length + 3);
  if (option("check")) {
    const saved: BudgetMeasurements = JSON.parse(
      await readFile(path.resolve(option("check")!), "utf8"),
    );
    const checks = evaluateBudgets(saved);
    console.table(
      checks.map(({ actual, limit, ...check }) => ({
        ...check,
        actual: Math.round(actual),
        limit,
      })),
    );
    if (checks.some(({ passed }) => !passed)) process.exitCode = 1;
    return;
  }
  const scales = (option("scales") ?? "1,3,8").split(",").map(Number);
  if (
    !scales.length ||
    scales.some((scale) => !Number.isInteger(scale) || scale < 1 || scale > 8) ||
    new Set(scales).size !== scales.length
  )
    throw new Error("Scales must be distinct integers from 1 through 8.");
  const output = option("output")
    ? path.resolve(option("output")!)
    : await mkdtemp(path.join(tmpdir(), "oenocademy-performance-"));
  if (!path.relative(repository, output).startsWith(`..${path.sep}`))
    throw new Error("Benchmark output must be outside the repository.");
  await mkdir(output, { recursive: true });
  if ((await readdir(output)).length) throw new Error("Benchmark output directory must be empty.");
  const logs = path.join(output, "logs");
  await mkdir(logs);
  const reference = option("reference");
  const referenceFile = reference
    ? await referenceModule(repository, output, reference)
    : undefined;
  const results: ScaleMeasurement[] = [];
  const report = {
    schemaVersion: 1,
    createdAt: new Date().toISOString(),
    revision: execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(),
    dirty: Boolean(execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).trim()),
    searchSourceSha256: createHash("sha256")
      .update(await readFile(path.join(repository, "src/content/search.ts")))
      .digest("hex"),
    reference,
    environment: {
      node: process.version,
      platform: platform(),
      release: release(),
      cpu: cpus()[0]?.model,
      logicalCpus: cpus().length,
      totalMemoryBytes: totalmem(),
    },
    method: {
      production: arguments_.includes("--production"),
      scales,
      searchRounds: 5,
      httpRounds: 3,
      sharedSourcesAndMedia: true,
      cold: "fresh process, warm OS filesystem; not a cloud cold start",
      compression: "JSON gzip/Brotli estimates; HTTP values are actual compressed body bytes",
    },
    inventory: await inventory(repository),
    scales: results,
  };

  const save = () =>
    writeFile(path.join(output, "results.json"), `${JSON.stringify(report, null, 2)}\n`);
  const loader = path.join(repository, "node_modules/tsx/dist/loader.mjs");
  for (const scale of scales) {
    const fixture = path.join(output, `fixture-${scale}x`);
    console.log(`[${scale}x] Creating isolated corpus`);
    const setupStarted = performance.now();
    await createCorpusFixture(repository, fixture, scale);
    const fixtureMs = performance.now() - setupStarted;
    try {
      const built = await command(
        ["--import", loader, path.join(repository, "scripts/performance/build-worker.ts"), fixture],
        repository,
        path.join(logs, `${scale}x-content.log`),
      );
      const content: ContentBuildMeasurement = JSON.parse(built.stdout);
      const bundleFile = path.join(fixture, "src/generated/content/knowledge-base.json");
      const bytes = await readFile(bundleFile);
      const bundle: GeneratedKnowledgeBase = JSON.parse(bytes.toString());
      const result = {
        scale,
        fixtureMs,
        content: { ...content, processMs: built.elapsedMs },
        transportEstimate: {
          gzipBytes: gzipSync(bytes).length,
          brotliBytes: brotliCompressSync(bytes).length,
        },
      };
      const searchArgs = [
        "--expose-gc",
        "--import",
        loader,
        path.join(repository, "scripts/performance/search-worker.ts"),
        bundleFile,
      ];
      const current: SearchMeasurement = JSON.parse(
        (await command(searchArgs, repository, path.join(logs, `${scale}x-search.log`))).stdout,
      );
      const measured: ScaleMeasurement = { ...result, search: current };
      if (referenceFile) {
        const previous: SearchMeasurement = JSON.parse(
          (
            await command(
              [...searchArgs, referenceFile],
              repository,
              path.join(logs, `${scale}x-reference.log`),
            )
          ).stdout,
        );
        measured.referenceSearch = previous;
        const fingerprint = (measurements: typeof current) =>
          measurements.results.map(({ fingerprint }: { fingerprint: string }) => fingerprint);
        if (JSON.stringify(fingerprint(current)) !== JSON.stringify(fingerprint(previous)))
          throw new Error(`Search ranking/snippet parity failed at ${scale}x`);
        measured.referenceParity = true;
      }
      results.push(measured);
      await save();
      console.log(
        `[${scale}x] Content validated; ${content.counts.entities} entities; search measured`,
      );
      if (arguments_.includes("--production")) {
        await addApplicationFixture(repository, fixture);
        const production = await command(
          [path.join(repository, "node_modules/next/dist/bin/next"), "build", "--webpack"],
          fixture,
          path.join(logs, `${scale}x-next-build.log`),
        );
        measured.productionBuildMs = production.elapsedMs;
        measured.artifacts = await measureBuildArtifacts(fixture);
        measured.server = await measureServer(fixture, 3310 + scale, bundle.media, scale === 1);
        await save();
        console.log(`[${scale}x] Production build and HTTP workload measured`);
      }
    } finally {
      if (!arguments_.includes("--keep-fixtures"))
        await rm(fixture, { recursive: true, force: true });
    }
  }
  if (arguments_.includes("--clone")) {
    const cloneDirectory = path.join(output, "local-clone");
    const cloned = await command(
      ["clone", "--local", "--no-hardlinks", repository, cloneDirectory],
      repository,
      path.join(logs, "clone.log"),
      "git",
    );
    Object.assign(report, {
      localClone: {
        ms: cloned.elapsedMs,
        method: "local full-history copy with checkout and no hardlinks; not a network clone",
      },
    });
    await rm(cloneDirectory, { recursive: true, force: true });
  }
  const checks = evaluateBudgets(report);
  Object.assign(report, { budgets: checks });
  if (arguments_.includes("--enforce") && checks.some(({ passed }) => !passed))
    process.exitCode = 1;
  await save();
  console.log(`Budgets: ${checks.filter(({ passed }) => passed).length}/${checks.length} passed`);
  console.log(`Results: ${path.join(output, "results.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
