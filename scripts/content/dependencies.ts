import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import {
  LOCALES,
  contentPlanSchema,
  type ContentBlockNode,
  type ContentDocument,
  type ContentInlineNode,
  type ContentPlan,
  type EntityType,
  type GeneratedEntity,
  type Locale,
} from "../../src/content/model";
import { generateEntityPackage } from "./generator";
import { buildContent } from "./pipeline";

interface LoadedPlan {
  directory: string;
  file: string;
  value: ContentPlan;
}

async function discoverFiles(directory: string, filename: string): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(
      entries.map(async (entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) return discoverFiles(entryPath, filename);
        return entry.isFile() && entry.name === filename ? [entryPath] : [];
      }),
    );
    return nested.flat().sort();
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function loadContentPlans(root = process.cwd()): Promise<LoadedPlan[]> {
  const absoluteRoot = path.resolve(root);
  const files = await discoverFiles(
    path.join(absoluteRoot, "content", "entities"),
    "content-plan.yaml",
  );
  return Promise.all(
    files.map(async (file) => {
      const parsed: unknown = parseYaml(await readFile(file, "utf8"));
      const result = contentPlanSchema.safeParse(parsed);
      if (!result.success) {
        const details = result.error.issues
          .map((issue) => `${issue.path.join(".") || "record"} ${issue.message}`)
          .join("; ");
        throw new Error(`${path.relative(absoluteRoot, file)}: ${details}`);
      }
      return { directory: path.dirname(file), file, value: result.data };
    }),
  );
}

export async function scaffoldPlanDependencies(
  packageId: string,
  root = process.cwd(),
): Promise<{ created: string[]; existing: string[] }> {
  const absoluteRoot = path.resolve(root);
  const plans = await loadContentPlans(absoluteRoot);
  const plan = plans.find(({ value }) => value.package_id === packageId);
  if (!plan) throw new Error(`No content-plan.yaml found for '${packageId}'.`);

  const entityFiles = await discoverFiles(
    path.join(absoluteRoot, "content", "entities"),
    "entity.yaml",
  );
  const existingIds = new Set<string>();
  for (const file of entityFiles) {
    const parsed = parseYaml(await readFile(file, "utf8")) as { id?: unknown };
    if (typeof parsed?.id === "string") existingIds.add(parsed.id);
  }

  const created: string[] = [];
  const existing: string[] = [];
  for (const dependency of plan.value.entity_dependencies) {
    if (existingIds.has(dependency.id)) {
      existing.push(dependency.id);
      continue;
    }
    const [type, slug] = dependency.id.split(".") as [EntityType, string];
    await generateEntityPackage({
      root: absoluteRoot,
      type,
      slug,
      canonicalName: dependency.names.en,
      names: dependency.names,
      slugs: dependency.slugs,
    });
    existingIds.add(dependency.id);
    created.push(dependency.id);
  }
  return { created, existing };
}

function collectInline(nodes: ContentInlineNode[], text: string[], links: Set<string>): void {
  for (const node of nodes) {
    if (node.type === "text") text.push(node.value);
    else if (node.type === "entity-link") links.add(node.entity_id);
    else if (node.type === "emphasis" || node.type === "strong" || node.type === "link") {
      collectInline(node.children, text, links);
    }
  }
}

function collectBlockNodes(nodes: ContentBlockNode[], text: string[], links: Set<string>): void {
  for (const node of nodes) {
    if (node.type === "paragraph" || node.type === "heading") {
      collectInline(node.children, text, links);
    } else if (node.type === "blockquote") {
      collectBlockNodes(node.children, text, links);
    } else if (node.type === "list") {
      for (const item of node.children) collectBlockNodes(item.children, text, links);
    } else if (node.type === "table") {
      for (const row of node.rows) {
        for (const cell of row) collectInline(cell, text, links);
      }
    }
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function documentFindings(
  ownerId: string,
  locale: Locale,
  document: ContentDocument,
  entities: GeneratedEntity[],
): string[] {
  const textParts: string[] = [];
  const links = new Set<string>();
  for (const block of document.blocks) collectBlockNodes(block.nodes, textParts, links);
  const plainText = textParts.join(" ");
  const findings: string[] = [];

  for (const target of entities) {
    if (target.id === ownerId || links.has(target.id)) continue;
    const labels = [target.names[locale], ...(target.aliases?.[locale] ?? [])]
      .map((label) => label.trim())
      .filter((label, index, all) => label.length >= 4 && all.indexOf(label) === index);
    const matched = labels.find((label) =>
      new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(label)}(?![\\p{L}\\p{N}])`, "iu").test(
        plainText,
      ),
    );
    if (matched)
      findings.push(`${ownerId}:${locale} mentions '${matched}' without linking ${target.id}`);
  }
  return findings;
}

export async function auditEntityLinks(root = process.cwd()): Promise<string[]> {
  const { knowledgeBase } = await buildContent({ root, write: false });
  const findings: string[] = [];
  for (const entity of knowledgeBase.entities) {
    for (const locale of LOCALES) {
      findings.push(
        ...documentFindings(entity.id, locale, entity.content[locale], knowledgeBase.entities),
      );
    }
  }
  for (const narrative of knowledgeBase.narratives) {
    for (const locale of LOCALES) {
      findings.push(
        ...documentFindings(
          narrative.id,
          locale,
          narrative.content[locale],
          knowledgeBase.entities,
        ),
      );
    }
  }
  return findings.sort();
}
