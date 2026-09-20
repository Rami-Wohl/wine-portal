import type { Entity, Relation } from "../../src/content/model";

export interface RelationAuditFinding {
  entityId: string;
  message: string;
}

type AuditableEntity = Pick<Entity, "id" | "type" | "status" | "relations">;

function hasIncomingRelation(
  entities: AuditableEntity[],
  entityId: string,
  type?: Relation["type"],
): boolean {
  return entities.some((entity) =>
    entity.relations.some(
      (relation) => relation.target === entityId && (type === undefined || relation.type === type),
    ),
  );
}

/**
 * Checks structural minimums that can be established from the canonical graph.
 * Editorial completeness remains a human review: a graph cannot infer every
 * relationship that ought to exist in the subject matter.
 */
export function auditActiveRelationCoverage(entities: AuditableEntity[]): RelationAuditFinding[] {
  const findings: RelationAuditFinding[] = [];

  for (const entity of entities.filter(({ status }) => status === "active")) {
    const hasIncoming = hasIncomingRelation(entities, entity.id);
    if (entity.relations.length === 0 && !hasIncoming) {
      findings.push({
        entityId: entity.id,
        message: "active entity has no forward or inverse relationship",
      });
    }

    if (
      entity.type === "appellation" &&
      !entity.relations.some(({ type }) => type === "part_of" || type === "parent_appellation")
    ) {
      findings.push({
        entityId: entity.id,
        message: "active appellation has no parent geography",
      });
    }

    if (
      entity.type === "producer" &&
      !entity.relations.some(({ type }) => type === "located_in" || type === "produces_in")
    ) {
      findings.push({
        entityId: entity.id,
        message: "active producer has no production location",
      });
    }

    if (
      entity.type === "classification" &&
      !entity.relations.some(({ type }) => type === "scope")
    ) {
      findings.push({
        entityId: entity.id,
        message: "active classification has no declared scope",
      });
    }

    const hasGeographicAssociation = entity.relations.some(
      ({ type, target }) =>
        type === "associated_with" &&
        (target.startsWith("region.") || target.startsWith("appellation.")),
    );
    if (
      entity.type === "grape" &&
      !hasIncomingRelation(entities, entity.id, "important_grape") &&
      !hasGeographicAssociation
    ) {
      findings.push({
        entityId: entity.id,
        message: "active grape has no documented geographic association",
      });
    }
  }

  return findings.sort(
    (left, right) =>
      left.entityId.localeCompare(right.entityId) || left.message.localeCompare(right.message),
  );
}
