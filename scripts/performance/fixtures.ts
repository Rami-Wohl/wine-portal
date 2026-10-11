import { cp, mkdir, readFile, readdir, symlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

export async function filesUnder(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const filename = path.join(directory, entry.name);
      return entry.isDirectory() ? filesUnder(filename) : Promise.resolve([filename]);
    }),
  );
  return nested.flat().sort();
}

interface Package {
  directory: string;
  metadata: Record<string, unknown>;
}

function suffixSlugs(value: unknown, suffix: string): unknown {
  if (Array.isArray(value)) return value.map((item) => suffixSlugs(item, suffix));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === "slugs"
        ? Object.fromEntries(
            Object.entries(child as Record<string, string>).map(([locale, slug]) => [
              locale,
              `${slug}${suffix}`,
            ]),
          )
        : suffixSlugs(child, suffix),
    ]),
  );
}

/** Synthetic copies are valid isolated packages, never additions to canonical content. */
export async function createCorpusFixture(
  repository: string,
  destination: string,
  scale: number,
): Promise<void> {
  const content = path.join(repository, "content");
  await mkdir(destination, { recursive: true });
  await cp(content, path.join(destination, "content"), { recursive: true });
  await symlink(path.join(repository, "data"), path.join(destination, "data"), "dir");
  await symlink(path.join(repository, "public"), path.join(destination, "public"), "dir");
  const metadataFiles = (await filesUnder(content)).filter((file) =>
    ["entity.yaml", "narrative.yaml", "learning-path.yaml"].includes(path.basename(file)),
  );
  const packages: Package[] = await Promise.all(
    metadataFiles.map(async (file) => ({
      directory: path.dirname(file),
      metadata: parseYaml(await readFile(file, "utf8")),
    })),
  );
  if (scale > 1 && packages.some(({ metadata }) => metadata.geography_id)) {
    throw new Error(
      "Geographic fixtures need an explicit cloning contract; never invent geography.",
    );
  }

  for (let copy = 2; copy <= scale; copy += 1) {
    const suffix = `-bench-${copy}`;
    const identifiers = new Map<string, string>();
    for (const { metadata } of packages) {
      const id = String(metadata.id);
      identifiers.set(id, `${id}${suffix}`);
      for (const assertion of (metadata.assertions ?? []) as Array<{ id: string }>) {
        identifiers.set(assertion.id, `${assertion.id}${suffix}`);
      }
    }
    const idPattern = new RegExp(
      `(?<![a-zA-Z0-9_.-])(?:${[...identifiers.keys()]
        .sort((a, b) => b.length - a.length)
        .map((id) => id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|")})(?![a-zA-Z0-9_.-])`,
      "g",
    );
    const replaceIds = (text: string) => text.replace(idPattern, (id) => identifiers.get(id)!);
    for (const item of packages) {
      const target = path.join(
        destination,
        "content",
        `${path.relative(content, item.directory)}${suffix}`,
      );
      await mkdir(target, { recursive: true });
      for (const filename of await filesUnder(item.directory)) {
        const relative = path.relative(item.directory, filename);
        let text = replaceIds(await readFile(filename, "utf8"));
        if (relative.endsWith(".yaml")) {
          // Plans repeat dependency slugs as a validated contract; keep those in sync too.
          text = stringifyYaml(suffixSlugs(parseYaml(text), suffix));
        }
        await mkdir(path.dirname(path.join(target, relative)), { recursive: true });
        await writeFile(path.join(target, relative), text);
      }
    }
  }
}

export async function addApplicationFixture(
  repository: string,
  destination: string,
): Promise<void> {
  await cp(path.join(repository, "src"), path.join(destination, "src"), {
    recursive: true,
    filter: (filename) => filename !== path.join(repository, "src/generated"),
  });
  for (const filename of ["package.json", "package-lock.json", "next.config.ts", "tsconfig.json"]) {
    await cp(path.join(repository, filename), path.join(destination, filename));
  }
  await symlink(
    path.join(repository, "node_modules"),
    path.join(destination, "node_modules"),
    "dir",
  );
}
