import { LOCALES, type Entity } from "../../../src/content/model";
import { relationLabel } from "../../../src/content/relations";
import type { LoadedRecord } from "./types";

export function validateRenderedRelationUniqueness(
  records: Array<LoadedRecord<Entity>>,
  issues: string[],
): void {
  for (const locale of LOCALES) {
    const firstByRenderedItem = new Map<
      string,
      { file: string; type: Entity["relations"][number]["type"] }
    >();

    for (const record of records) {
      for (const relation of record.value.relations) {
        const appearances = [
          {
            entity: record.value.id,
            related: relation.target,
            label: relationLabel(relation.type, "forward", locale),
          },
          {
            entity: relation.target,
            related: record.value.id,
            label: relationLabel(relation.type, "inverse", locale),
          },
        ];

        for (const appearance of appearances) {
          const key = JSON.stringify([appearance.entity, appearance.label, appearance.related]);
          const first = firstByRenderedItem.get(key);
          if (first) {
            issues.push(
              `${record.file}: Related topics for '${appearance.entity}' would list ` +
                `'${appearance.related}' more than once under '${appearance.label}' (${locale}); ` +
                `the overlapping '${first.type}' relation is declared in ${first.file}. ` +
                "Store the connection once and let inverse relations be derived.",
            );
          } else {
            firstByRenderedItem.set(key, { file: record.file, type: relation.type });
          }
        }
      }
    }
  }
}
