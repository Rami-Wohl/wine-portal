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

describe("generated geography import boundary", () => {
  it.each([
    'import index from "@/generated/geography/index.json";',
    'import scene from "../generated/geography/scenes/scene.medoc.json";',
    'const scene = require("../generated/geography/scenes/scene.medoc.json");',
    'const index = import("@/generated/geography/index.json");',
  ])("blocks direct Atlas asset access: %s", async (code) => {
    const errors = await boundaryErrors(code);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toMatch(/geography repository/);
  });

  it("allows only the geography repository to read Atlas assets", async () => {
    const code = 'import index from "../generated/geography/index.json";';
    expect(await boundaryErrors(code, "src/content/geography.ts")).toHaveLength(0);
    expect(await boundaryErrors(code, "src/content/repository.ts")).toHaveLength(1);
    expect(
      await boundaryErrors(
        'import data from "../generated/content/knowledge-base.json";',
        "src/content/geography.ts",
      ),
    ).toHaveLength(1);
  });
});
