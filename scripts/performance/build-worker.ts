import { performance } from "node:perf_hooks";
import { buildContent } from "../content/pipeline";

export async function measureContentBuild(root: string) {
  const started = performance.now();
  const { knowledgeBase, outputs } = await buildContent({ root });
  return {
    ms: performance.now() - started,
    maxRssKiB: process.resourceUsage().maxRSS,
    memory: process.memoryUsage(),
    counts: {
      entities: knowledgeBase.entities.length,
      activeEntities: knowledgeBase.entities.filter(({ status }) => status === "active").length,
      narratives: knowledgeBase.narratives.length,
      paths: knowledgeBase.learning_paths.length,
      sources: knowledgeBase.sources.length,
      media: knowledgeBase.media.length,
    },
    bundleBytes: Buffer.byteLength(outputs["knowledge-base.json"]),
  };
}

export type ContentBuildMeasurement = Awaited<ReturnType<typeof measureContentBuild>>;

if (process.argv[1]?.endsWith("build-worker.ts")) {
  measureContentBuild(process.argv[2])
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
