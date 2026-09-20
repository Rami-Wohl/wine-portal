import { describe, expect, it } from "vitest";
import type { Entity } from "../../src/content/model";
import { auditActiveRelationCoverage } from "./relation-audit";

type AuditableEntity = Pick<Entity, "id" | "type" | "status" | "relations">;

function entity(
  id: string,
  type: Entity["type"],
  relations: Entity["relations"] = [],
): AuditableEntity {
  return { id, type, status: "active", relations };
}

describe("active relation coverage audit", () => {
  it("accepts entities that meet their structural relationship minimums", () => {
    const entities = [
      entity("region.example", "region", [{ type: "important_grape", target: "grape.example" }]),
      entity("grape.example", "grape"),
      entity("appellation.example", "appellation", [{ type: "part_of", target: "region.example" }]),
      entity("producer.example", "producer", [
        { type: "located_in", target: "appellation.example" },
      ]),
      entity("classification.example", "classification", [
        { type: "scope", target: "appellation.example" },
      ]),
    ];

    expect(auditActiveRelationCoverage(entities)).toEqual([]);
  });

  it("reports missing type-specific minimums and ignores drafts", () => {
    const entities: AuditableEntity[] = [
      entity("appellation.orphan", "appellation"),
      entity("producer.orphan", "producer"),
      { ...entity("classification.draft", "classification"), status: "draft" },
    ];

    expect(auditActiveRelationCoverage(entities)).toEqual([
      {
        entityId: "appellation.orphan",
        message: "active appellation has no parent geography",
      },
      {
        entityId: "appellation.orphan",
        message: "active entity has no forward or inverse relationship",
      },
      {
        entityId: "producer.orphan",
        message: "active entity has no forward or inverse relationship",
      },
      {
        entityId: "producer.orphan",
        message: "active producer has no production location",
      },
    ]);
  });

  it("accepts a geographically associated grape without exaggerating its importance", () => {
    const entities = [
      entity("appellation.example", "appellation", [{ type: "part_of", target: "region.example" }]),
      entity("region.example", "region"),
      entity("grape.accessory", "grape", [
        { type: "associated_with", target: "appellation.example" },
      ]),
    ];

    expect(auditActiveRelationCoverage(entities)).toEqual([]);
  });

  it("does not mistake a conceptual link for a grape's geographic association", () => {
    const entities = [
      entity("grape.unplaced", "grape", [{ type: "related_to", target: "concept.example" }]),
      entity("concept.example", "concept"),
    ];

    expect(auditActiveRelationCoverage(entities)).toEqual([
      {
        entityId: "grape.unplaced",
        message: "active grape has no documented geographic association",
      },
    ]);
  });
});
