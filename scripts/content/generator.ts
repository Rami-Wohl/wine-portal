import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { stringify as stringifyYaml } from "yaml";
import { ENTITY_TYPE_DIRECTORIES, ENTITY_TYPES, type EntityType } from "../../src/content/model";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface GenerateEntityOptions {
  root?: string;
  type: string;
  slug: string;
}

function titleFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

async function pathExists(target: string): Promise<boolean> {
  try {
    await stat(target);
    return true;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return false;
    throw error;
  }
}

export async function generateEntityPackage(options: GenerateEntityOptions): Promise<string> {
  if (!ENTITY_TYPES.includes(options.type as EntityType)) {
    throw new Error(
      `Unknown entity type '${options.type}'. Allowed types: ${ENTITY_TYPES.join(", ")}`,
    );
  }
  if (!slugPattern.test(options.slug))
    throw new Error(`Invalid slug '${options.slug}'. Use lowercase kebab-case.`);
  const type = options.type as EntityType;
  const root = path.resolve(options.root ?? process.cwd());
  const packageDirectory = path.join(
    root,
    "content",
    "entities",
    ENTITY_TYPE_DIRECTORIES[type],
    options.slug,
  );
  if (await pathExists(packageDirectory))
    throw new Error(`Content package already exists: ${path.relative(root, packageDirectory)}`);
  const starterName = titleFromSlug(options.slug);
  const metadata = {
    id: `${type}.${options.slug}`,
    type,
    status: "draft",
    canonical_name: starterName,
    names: { nl: starterName, en: starterName },
    slugs: { nl: options.slug, en: options.slug },
    locales: { nl: "overview.nl.md", en: "overview.en.md" },
    relations: [],
    assertions: [],
    source_refs: [],
  };
  await mkdir(packageDirectory, { recursive: true });
  await Promise.all([
    writeFile(path.join(packageDirectory, "entity.yaml"), stringifyYaml(metadata), "utf8"),
    writeFile(path.join(packageDirectory, "overview.nl.md"), "", "utf8"),
    writeFile(path.join(packageDirectory, "overview.en.md"), "", "utf8"),
  ]);
  return packageDirectory;
}
