import { type EntityType, type Locale, type Depth } from "./common";
import { type LearningPath } from "./learning-paths";
import { type ContentDocument } from "./documents";
import { type Source, type MediaAsset } from "./provenance";
import { type Entity, type Relation } from "./entities";
import { type Narrative } from "./narratives";

export interface ResolvedRelation extends Relation {
  source: string;
}

export interface NarrativeMention {
  entity_id: string;
  label: string | null;
  locale: Locale;
}

export interface SearchPassage {
  block_id: string;
  kind: "content" | "media-caption";
  depth: Depth | null;
  heading: string | null;
  text: string;
}

export interface EntitySearchIndexEntry {
  kind: "entity";
  id: string;
  status: Entity["status"];
  entity_type: EntityType;
  canonical_name: string;
  names: Record<Locale, string>;
  aliases: Record<Locale, string[]>;
  slugs: Record<Locale, string>;
  passages: Record<Locale, SearchPassage[]>;
}

export interface NarrativeSearchIndexEntry {
  kind: "narrative";
  id: string;
  status: Narrative["status"];
  narrative_type: Narrative["type"];
  titles: Record<Locale, string>;
  slugs: Record<Locale, string>;
  passages: Record<Locale, SearchPassage[]>;
}

export type SearchIndexEntry = EntitySearchIndexEntry | NarrativeSearchIndexEntry;

export type GeneratedEntity = Entity & {
  content: Record<Locale, ContentDocument>;
};

export type GeneratedNarrative = Narrative & {
  mentions: NarrativeMention[];
  content: Record<Locale, ContentDocument>;
};

export interface LearningPathMembership {
  path_id: string;
  step_id: string;
}

export interface GeneratedKnowledgeBase {
  entities: GeneratedEntity[];
  narratives: GeneratedNarrative[];
  learning_paths: LearningPath[];
  sources: Source[];
  media: MediaAsset[];
  relations: {
    forward: ResolvedRelation[];
    inverse: Record<string, ResolvedRelation[]>;
  };
  backlinks: Record<string, string[]>;
  indexes: {
    entity_ids: string[];
    entities_by_type: Record<EntityType, string[]>;
    localized_slugs: Record<Locale, Record<string, string>>;
    learning_path_ids: string[];
    learning_path_slugs: Record<Locale, Record<string, string>>;
    lesson_memberships: Record<string, LearningPathMembership[]>;
    geography: Record<string, string>;
    search: SearchIndexEntry[];
  };
}
