import type {
  Entity,
  Narrative,
  LearningPath,
  ContentPlan,
  Source,
  MediaAsset,
  Locale,
  ContentDocument,
  NarrativeMention,
  GeographyRecord,
  Scene,
} from "../../../src/content/model";
import type { GeographyFeature } from "../../geography/lib/geometry";

export interface LoadedRecord<T> {
  file: string;
  directory: string;
  value: T;
}

export interface LoadedContentRecords {
  entityRecords: LoadedRecord<Entity>[];
  narrativeRecords: LoadedRecord<Narrative>[];
  learningPathRecords: LoadedRecord<LearningPath>[];
  planRecords: LoadedRecord<ContentPlan>[];
  sourceRecords: LoadedRecord<Source>[];
  mediaRecords: LoadedRecord<MediaAsset>[];
  geographyRecords: LoadedRecord<GeographyRecord>[];
  sceneRecords: LoadedRecord<Scene>[];
}

export interface ParsedGeographyFeature {
  record: LoadedRecord<GeographyRecord>;
  feature: GeographyFeature;
}

export interface ParsedGeography {
  /** Records whose GeoJSON parsed, keyed by record ID; geometry never enters the bundle. */
  features: Map<string, ParsedGeographyFeature>;
  scenes: LoadedRecord<Scene>[];
}

export interface ParsedContent {
  entityIds: string[];
  entityContentMap: Map<string, Record<Locale, ContentDocument>>;
  narrativeContentMap: Map<string, Record<Locale, ContentDocument>>;
  mentionMap: Map<string, NarrativeMention[]>;
  geography: ParsedGeography;
}
