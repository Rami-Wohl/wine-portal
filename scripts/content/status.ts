import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  ENTITY_TYPE_DIRECTORIES,
  entityPresentationMode,
  type GeneratedEntity,
} from "../../src/content/model";
import { ENTITY_ROUTE_SEGMENTS, ENTITY_TYPE_LABELS_NL } from "../../src/content/routing";

const STATUS_ORDER = ["active", "draft", "deprecated"] as const;

const STATUS_COPY = {
  active: {
    heading: "Actief — publiek vindbaar",
    explanation:
      "Actieve monografieën zijn zichtbaar in Explore en de sitemap. Actieve collectieprofielen en registervermeldingen zijn vindbaar via zoeken, links en hun eigenaarpagina.",
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

function entityRoute(entity: GeneratedEntity, entitiesById: Map<string, GeneratedEntity>): string {
  const directRoute = `/${ENTITY_ROUTE_SEGMENTS[entity.type]}/${entity.slugs.nl}`;
  if (entity.presentation && entity.presentation.mode !== "monograph") {
    const owner = entitiesById.get(entity.presentation.owner);
    if (owner) {
      const target = `/${ENTITY_ROUTE_SEGMENTS[owner.type]}/${owner.slugs.nl}#${entity.presentation.anchor}`;
      return entity.status === "active" ? target : `${directRoute} → gepland: ${target}`;
    }
  }
  return directRoute;
}

function presentationLabel(entity: GeneratedEntity): string {
  switch (entityPresentationMode(entity)) {
    case "monograph":
      return entity.type === "producer" ? "Monografie" : "Zelfstandige pagina";
    case "collection-profile":
      return "Collectieprofiel";
    case "register-entry":
      return "Registervermelding";
  }
}

function entitySourcePath(entity: GeneratedEntity): string {
  const slug = entity.id.slice(entity.id.indexOf(".") + 1);
  return `../content/entities/${ENTITY_TYPE_DIRECTORIES[entity.type]}/${slug}/entity.yaml`;
}

export function renderEntityStatus(entities: GeneratedEntity[]): string {
  const collator = new Intl.Collator("nl", { sensitivity: "base" });
  const entitiesById = new Map(entities.map((entity) => [entity.id, entity]));
  const producers = entities.filter((entity) => entity.type === "producer");
  const lines = [
    "# Entiteitenstatus",
    "",
    "Dit overzicht wordt automatisch uit de canonical `entity.yaml`-bestanden opgebouwd door `npm run content:status` en iedere `content:build`. Bewerk de tabellen niet handmatig.",
    "",
    `**Totaal:** ${entities.length} entities — ${STATUS_ORDER.map((status) => `${entities.filter((entity) => entity.status === status).length} ${status}`).join(", ")}.`,
    "",
    `**Producentenrecords:** ${producers.length} — ${producers.filter((entity) => entityPresentationMode(entity) === "monograph").length} monografie, ${producers.filter((entity) => entityPresentationMode(entity) === "collection-profile").length} collectieprofiel, ${producers.filter((entity) => entityPresentationMode(entity) === "register-entry").length} registervermelding.`,
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
      "| Naam | Type | Publicatievorm | ID | Publiek | Nederlandse bestemming | Laatst beoordeeld |",
      "| --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const entity of entitiesWithStatus) {
      lines.push(
        `| [${entity.names.nl}](${entitySourcePath(entity)}) | ${ENTITY_TYPE_LABELS_NL[entity.type]} | ${presentationLabel(entity)} | \`${entity.id}\` | ${copy.visibility} | \`${entityRoute(entity, entitiesById)}\` | ${entity.last_reviewed ?? "—"} |`,
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
