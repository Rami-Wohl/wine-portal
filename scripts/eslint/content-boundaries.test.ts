import { ESLint } from "eslint";
import path from "node:path";
import { describe, expect, it } from "vitest";

const eslint = new ESLint();
const rule = "content-boundaries/generated-content";
async function boundaryErrors(code: string, filePath = "src/components/example.tsx") {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((message) => message.ruleId === rule);
}

describe("generated content import boundary", () => {
  it.each([
    'import data from "@/generated/content/knowledge-base.json";',
    'import data from "../generated/content/knowledge-base.json";',
    'export { default } from "@/generated/content/knowledge-base.json";',
    'export * from "../generated/content/knowledge-base.json";',
    'const data = import("@/generated/content/knowledge-base.json");',
    'const data = require("../generated/content/knowledge-base.json");',
    'import data from "../generated/../generated/content/knowledge-base.json";',
    `import data from ${JSON.stringify(path.resolve("src/generated/content/knowledge-base.json"))};`,
  ])("blocks a direct bundle access: %s", async (code) => {
    expect(await boundaryErrors(code)).toHaveLength(1);
  });

  it("allows the repository to read its own generated input", async () => {
    expect(
      await boundaryErrors(
        'import data from "../generated/content/knowledge-base.json";',
        "src/content/repository.ts",
      ),
    ).toHaveLength(0);
  });

  it("allows shared model types and small serialized props in client modules", async () => {
    expect(
      await boundaryErrors('"use client"; import type { Locale } from "@/content/model";'),
    ).toHaveLength(0);
  });
});
