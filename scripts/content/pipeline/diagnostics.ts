import type { Entity } from "../../../src/content/model";
import type { LoadedRecord } from "./types";

export class ContentValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(
      `Content validation failed with ${issues.length} issue${issues.length === 1 ? "" : "s"}:\n\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
    );
    this.name = "ContentValidationError";
  }
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

export function unknownReferenceMessage(
  reference: string,
  knownIds: string[],
  referenceKind = "entity",
): string {
  const suggestion = knownIds
    .map((id) => ({ id, distance: levenshtein(reference, id) }))
    .sort((left, right) => left.distance - right.distance || left.id.localeCompare(right.id))[0];
  const hint = suggestion && suggestion.distance <= 4 ? ` Did you mean '${suggestion.id}'?` : "";
  const kind = referenceKind ? `${referenceKind} ` : "";
  return `Unknown ${kind}reference '${reference}'.${hint}`;
}

export function findDuplicates(
  values: Array<{ key: string; file: string }>,
  label: string,
  issues: string[],
): void {
  const firstByKey = new Map<string, string>();
  for (const { key, file } of values) {
    const first = firstByKey.get(key);
    if (first) issues.push(`Duplicate ${label} '${key}' in ${first} and ${file}`);
    else firstByKey.set(key, file);
  }
}

export function findDuplicatesWithinRecord(
  values: string[],
  label: string,
  file: string,
  issues: string[],
): void {
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) issues.push(`${file}: Duplicate ${label} '${value}'`);
    seen.add(value);
  }
}

export function findDuplicateRelations(record: LoadedRecord<Entity>, issues: string[]): void {
  const seen = new Set<string>();
  for (const relation of record.value.relations) {
    const key = JSON.stringify(relation);
    if (seen.has(key)) {
      issues.push(`${record.file}: Duplicate relation '${relation.type}' to '${relation.target}'`);
    }
    seen.add(key);
  }
}
