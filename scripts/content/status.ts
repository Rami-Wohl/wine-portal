import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ENTITY_TYPE_DIRECTORIES, type GeneratedEntity } from "../../src/content/model";
import { ENTITY_ROUTE_SEGMENTS, ENTITY_TYPE_LABELS_NL } from "../../src/content/routing";

const STATUS_ORDER = ["active", "draft", "deprecated"] as const;

const STATUS_COPY = {
  active: {
    heading: "Actief — publiek vindbaar",
    explanation:
      "Deze entities horen zichtbaar te zijn in Explore, zoeken, backlinks en de sitemap.",
    visibility: "Ja",
  },
  draft: {
    heading: "Draft — nog uit te werken",
    explanation:
      "Deze entities zijn alleen via hun directe reviewroute bereikbaar, tonen een incomplete state en krijgen `noindex`.",
    visibility: "Nee — reviewroute",
  },
  deprecated: {
    heading: "Vervallen — niet publiek",
    explanation:
      "Deze entities blijven alleen bestaan voor historie of een gecontroleerde overgang.",
    visibility: "Nee",
  },
} as const;

function entityRoute(entity: GeneratedEntity): string {
  return `/${ENTITY_ROUTE_SEGMENTS[entity.type]}/${entity.slugs.nl}`;
}

function entitySourcePath(entity: GeneratedEntity): string {
  const slug = entity.id.slice(entity.id.indexOf(".") + 1);
  return `../content/entities/${ENTITY_TYPE_DIRECTORIES[entity.type]}/${slug}/entity.yaml`;
}

export function renderEntityStatus(entities: GeneratedEntity[]): string {
  const collator = new Intl.Collator("nl", { sensitivity: "base" });
  const lines = [
    "# Entiteitenstatus",
    "",
    "Dit overzicht wordt automatisch uit de canonical `entity.yaml`-bestanden opgebouwd door `npm run content:status` en iedere `content:build`. Bewerk de tabellen niet handmatig.",
    "",
    `**Totaal:** ${entities.length} entities — ${STATUS_ORDER.map((status) => `${entities.filter((entity) => entity.status === status).length} ${status}`).join(", ")}.`,
    "",
  ];

  for (const status of STATUS_ORDER) {
    const entitiesWithStatus = entities
      .filter((entity) => entity.status === status)
      .sort(
        (left, right) =>
          collator.compare(ENTITY_TYPE_LABELS_NL[left.type], ENTITY_TYPE_LABELS_NL[right.type]) ||
          collator.compare(left.names.nl, right.names.nl) ||
          left.id.localeCompare(right.id),
      );
    const copy = STATUS_COPY[status];
    lines.push(`## ${copy.heading} (${entitiesWithStatus.length})`, "", copy.explanation, "");
    if (entitiesWithStatus.length === 0) {
      lines.push("_Geen entities met deze status._", "");
      continue;
    }
    lines.push(
      "| Naam | Type | ID | Publiek | Nederlandse route | Laatst beoordeeld |",
      "| --- | --- | --- | --- | --- | --- |",
    );
    for (const entity of entitiesWithStatus) {
      lines.push(
        `| [${entity.names.nl}](${entitySourcePath(entity)}) | ${ENTITY_TYPE_LABELS_NL[entity.type]} | \`${entity.id}\` | ${copy.visibility} | \`${entityRoute(entity)}\` | ${entity.last_reviewed ?? "—"} |`,
      );
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export async function writeEntityStatus(
  entities: GeneratedEntity[],
  root = process.cwd(),
): Promise<string> {
  const outputPath = path.join(path.resolve(root), "docs", "entity-status.md");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderEntityStatus(entities), "utf8");
  return outputPath;
}
