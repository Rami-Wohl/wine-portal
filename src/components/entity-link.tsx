import Link from "next/link";
import type { Entity } from "@/content/model";
import { entityHref, ENTITY_TYPE_LABELS_NL } from "@/content/routing";

export function EntityLink({ entity }: { entity: Entity }) {
  return (
    <Link className="entity-link" href={entityHref(entity)}>
      <span>{entity.names.nl}</span>
      <small>{ENTITY_TYPE_LABELS_NL[entity.type]}</small>
    </Link>
  );
}
