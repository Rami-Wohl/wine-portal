import type { Entity, Locale } from "@/content/model";
import { getEntityPublicHref } from "@/content/repository";
import { contentLabels } from "@/content/routing";
import Link from "next/link";

export function EntityLink({ entity, locale = "nl" }: { entity: Entity; locale?: Locale }) {
  return (
    <Link className="entity-link" href={getEntityPublicHref(entity, locale)}>
      <span>{entity.names[locale]}</span>
      <small>{contentLabels(locale).entity[entity.type]}</small>
    </Link>
  );
}
