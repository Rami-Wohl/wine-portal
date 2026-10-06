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
} from "../../../src/content/model";

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
}
export interface ParsedContent {
  entityIds: string[];
  entityContentMap: Map<string, Record<Locale, ContentDocument>>;
  narrativeContentMap: Map<string, Record<Locale, ContentDocument>>;
  mentionMap: Map<string, NarrativeMention[]>;
}
