import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type {
  CaveatVariant,
  ContentBlock,
  ContentBlockNode,
  ContentDocument,
  ContentInlineNode,
  Locale,
  MediaAsset,
  Source,
} from "@/content/model";
import { mediaUrl } from "@/content/media";
import { getEntityById, getEntityPublicHref } from "@/content/repository";

const BLOCK_LABELS: Record<Locale, Record<"objectives" | "key-idea" | "in-the-glass", string>> = {
  nl: {
    objectives: "Leerdoelen",
    "key-idea": "Kernidee",
    "in-the-glass": "Waarom doet dit ertoe in het glas?",
  },
  en: {
    objectives: "Learning objectives",
    "key-idea": "Key idea",
    "in-the-glass": "Why does this matter in the glass?",
  },
};

const CAVEAT_LABELS: Record<Locale, Record<CaveatVariant, string>> = {
  nl: {
    simplification: "Bewuste vereenvoudiging",
    uncertainty: "Onzekerheid",
    exception: "Belangrijke uitzondering",
  },
  en: {
    simplification: "Deliberate simplification",
    uncertainty: "Uncertainty",
    exception: "Important exception",
  },
};

const DETAIL_DEPTH_LABELS: Record<Locale, Record<"intermediate" | "advanced", string>> = {
  nl: {
    intermediate: "Verdieping",
    advanced: "Gevorderd",
  },
  en: {
    intermediate: "Intermediate",
    advanced: "Advanced",
  },
};

interface RenderContext {
  locale: Locale;
  sources: Map<string, Source>;
  sourceNumbers: Map<string, number>;
  media: Map<string, MediaAsset>;
}

function renderDepthMarker(depth: ContentBlock["depth"], locale: Locale): ReactNode {
  if (depth !== "intermediate" && depth !== "advanced") return null;

  return (
    <span className="content-depth-marker">
      <span aria-hidden="true" className="content-depth-marker-symbol" />
      {DETAIL_DEPTH_LABELS[locale][depth]}
    </span>
  );
}

function renderInline(nodes: ContentInlineNode[], context: RenderContext): ReactNode {
  return nodes.map((node, index) => {
    const key = `${node.type}-${index}`;
    switch (node.type) {
      case "text":
        return <Fragment key={key}>{node.value}</Fragment>;
      case "inline-code":
        return <code key={key}>{node.value}</code>;
      case "break":
        return <br key={key} />;
      case "emphasis":
        return <em key={key}>{renderInline(node.children, context)}</em>;
      case "strong":
        return <strong key={key}>{renderInline(node.children, context)}</strong>;
      case "link": {
        const children = renderInline(node.children, context);
        if (node.url.startsWith("/") || node.url.startsWith("#")) {
          return (
            <Link href={node.url} key={key} title={node.title ?? undefined}>
              {children}
            </Link>
          );
        }
        return (
          <a
            href={node.url}
            key={key}
            rel={node.url.startsWith("http") ? "noreferrer" : undefined}
            target={node.url.startsWith("http") ? "_blank" : undefined}
            title={node.title ?? undefined}
          >
            {children}
          </a>
        );
      }
      case "entity-link": {
        const entity = getEntityById(node.entity_id);
        if (!entity) return null;
        return (
          <Link className="content-entity-link" href={getEntityPublicHref(entity)} key={key}>
            {node.label ?? entity.names[context.locale]}
          </Link>
        );
      }
      case "citation": {
        const source = context.sources.get(node.source_id);
        const number = context.sourceNumbers.get(node.source_id);
        if (!source || !number) return null;
        const locator = node.locator ? `, ${node.locator}` : "";
        const label = `${source.title}${locator}`;
        const marker = <span aria-hidden="true">[{number}]</span>;
        return (
          <sup className="content-citation" key={key}>
            <a
              href={`#source-${number}`}
              aria-label={`${context.locale === "nl" ? "Bron" : "Source"} ${number}: ${label}`}
              title={label}
            >
              {marker}
            </a>
          </sup>
        );
      }
    }
  });
}

function renderBlockNodes(nodes: ContentBlockNode[], context: RenderContext): ReactNode {
  return nodes.map((node, index) => {
    const key = `${node.type}-${index}`;
    switch (node.type) {
      case "paragraph":
        return <p key={key}>{renderInline(node.children, context)}</p>;
      case "heading":
        return node.depth === 2 ? (
          <h2 key={key}>{renderInline(node.children, context)}</h2>
        ) : (
          <h3 key={key}>{renderInline(node.children, context)}</h3>
        );
      case "list": {
        const items = node.children.map((item, itemIndex) => (
          <li key={`item-${itemIndex}`}>{renderBlockNodes(item.children, context)}</li>
        ));
        return node.ordered ? (
          <ol key={key} start={node.start ?? undefined}>
            {items}
          </ol>
        ) : (
          <ul key={key}>{items}</ul>
        );
      }
      case "blockquote":
        return <blockquote key={key}>{renderBlockNodes(node.children, context)}</blockquote>;
      case "table": {
        const [header, ...body] = node.rows;
        return (
          <div
            className="content-table-scroll"
            key={key}
            role="region"
            aria-label={context.locale === "nl" ? "Tabel" : "Table"}
            tabIndex={0}
          >
            <table>
              {header ? (
                <thead>
                  <tr>
                    {header.map((cell, cellIndex) => (
                      <th
                        key={`header-${cellIndex}`}
                        scope="col"
                        style={{ textAlign: node.align[cellIndex] ?? undefined }}
                      >
                        {renderInline(cell, context)}
                      </th>
                    ))}
                  </tr>
                </thead>
              ) : null}
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={`cell-${cellIndex}`}
                        style={{ textAlign: node.align[cellIndex] ?? undefined }}
                      >
                        {renderInline(cell, context)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }
  });
}

function renderContentBlock(
  block: ContentBlock,
  context: RenderContext,
  showDepthMarker = true,
): ReactNode {
  const className = [
    "content-block",
    `content-block-${block.type}`,
    block.depth ? `content-depth-${block.depth}` : null,
  ]
    .filter(Boolean)
    .join(" ");
  const content = renderBlockNodes(block.nodes, context);
  const common = { id: block.id, className, tabIndex: -1 };

  switch (block.type) {
    case "figure": {
      const asset = block.media_id ? context.media.get(block.media_id) : undefined;
      if (!asset) return null;
      const caption = asset.caption?.[context.locale];
      const credit = asset.rights.credit_line;
      const isTall = asset.height / asset.width >= 2;
      const isGalleryImage = asset.role === "representative";
      const hasDescription = block.nodes.length > 0;
      return (
        <figure {...common}>
          <Image
            alt={asset.alt[context.locale]}
            className={isTall ? "content-media-tall" : undefined}
            height={asset.height}
            sizes={
              isGalleryImage
                ? "(max-width: 620px) calc(100vw - 32px), 370px"
                : isTall
                  ? "(max-width: 620px) 50vw, 220px"
                  : "(max-width: 620px) calc(100vw - 32px), 760px"
            }
            src={mediaUrl(asset)}
            width={asset.width}
          />
          <figcaption>
            {hasDescription ? <div className="content-figure-description">{content}</div> : null}
            {caption ? <span>{caption}</span> : null}
            <small>
              {asset.rights.source_url ? (
                <a href={asset.rights.source_url} rel="noreferrer" target="_blank">
                  {credit}
                </a>
              ) : (
                credit
              )}
              {asset.rights.license_url ? (
                <>
                  {" "}
                  ·{" "}
                  <a href={asset.rights.license_url} rel="noreferrer" target="_blank">
                    {asset.rights.license_name}
                  </a>
                </>
              ) : null}
            </small>
          </figcaption>
        </figure>
      );
    }
    case "summary":
      return <div {...common}>{content}</div>;
    case "section":
      return <section {...common}>{content}</section>;
    case "comparison":
      return <section {...common}>{content}</section>;
    case "register-entry":
      return (
        <div {...common} data-parent={block.parent ?? undefined}>
          {content}
        </div>
      );
    case "detail":
      return (
        <div {...common} data-parent={block.parent ?? undefined}>
          {showDepthMarker ? renderDepthMarker(block.depth, context.locale) : null}
          {content}
        </div>
      );
    case "objectives": {
      const titleId = `${block.id}-title`;
      return (
        <section {...common} aria-labelledby={titleId}>
          <h2 className="content-block-title" id={titleId}>
            {BLOCK_LABELS[context.locale].objectives}
          </h2>
          {content}
        </section>
      );
    }
    case "key-idea":
      return (
        <aside {...common} aria-label={BLOCK_LABELS[context.locale]["key-idea"]}>
          <p className="content-block-label">{BLOCK_LABELS[context.locale]["key-idea"]}</p>
          {content}
        </aside>
      );
    case "caveat": {
      const label = block.variant
        ? CAVEAT_LABELS[context.locale][block.variant]
        : context.locale === "nl"
          ? "Nuance"
          : "Nuance";
      return (
        <aside {...common} aria-label={label}>
          <p className="content-block-label">{label}</p>
          {content}
        </aside>
      );
    }
    case "in-the-glass": {
      const titleId = `${block.id}-title`;
      return (
        <section {...common} aria-labelledby={titleId}>
          <h2 className="content-block-title" id={titleId}>
            {BLOCK_LABELS[context.locale]["in-the-glass"]}
          </h2>
          {content}
        </section>
      );
    }
  }
}

function renderSectionChildren(children: ContentBlock[], context: RenderContext): ReactNode[] {
  const items: ReactNode[] = [];

  for (let index = 0; index < children.length; index += 1) {
    const child = children[index];
    if (child.type !== "detail" || (child.depth !== "intermediate" && child.depth !== "advanced")) {
      items.push(<Fragment key={child.id}>{renderContentBlock(child, context)}</Fragment>);
      continue;
    }

    const run = [child];
    while (children[index + 1]?.type === "detail" && children[index + 1]?.depth === child.depth) {
      run.push(children[index + 1]);
      index += 1;
    }
    items.push(
      <div
        className={`content-depth-detail-run content-depth-${child.depth}`}
        data-depth-detail-run={child.depth}
        key={`detail-run-${child.id}`}
      >
        {renderDepthMarker(child.depth, context.locale)}
        <div className="content-depth-detail-run-body">
          {run.map((runChild) => (
            <Fragment key={runChild.id}>{renderContentBlock(runChild, context, false)}</Fragment>
          ))}
        </div>
      </div>,
    );
  }

  return items;
}

export function ContentDocumentView({
  document,
  locale,
  media,
  sources,
}: {
  document: ContentDocument;
  locale: Locale;
  media: MediaAsset[];
  sources: Source[];
}) {
  const sourceMap = new Map(sources.map((source) => [source.id, source]));
  const sourceNumbers = new Map(sources.map((source, index) => [source.id, index + 1]));
  const mediaMap = new Map(media.map((asset) => [asset.id, asset]));
  const context: RenderContext = { locale, media: mediaMap, sources: sourceMap, sourceNumbers };

  const units: Array<{
    content: ReactNode;
    depth: ContentBlock["depth"];
    key: string;
    type: "other" | "section";
  }> = [];
  for (let index = 0; index < document.blocks.length; index += 1) {
    const block = document.blocks[index];
    const galleryAsset =
      block.type === "figure" && block.media_id ? mediaMap.get(block.media_id) : undefined;
    if (block.type === "figure" && galleryAsset?.role === "representative") {
      const galleryBlocks = [block];
      while (document.blocks[index + 1]?.type === "figure") {
        const nextBlock = document.blocks[index + 1];
        const nextAsset = nextBlock.media_id ? mediaMap.get(nextBlock.media_id) : undefined;
        if (nextAsset?.role !== "representative") break;
        galleryBlocks.push(nextBlock);
        index += 1;
      }
      units.push({
        content: (
          <div className="content-media-gallery">
            {galleryBlocks.map((galleryBlock) => (
              <Fragment key={galleryBlock.id}>{renderContentBlock(galleryBlock, context)}</Fragment>
            ))}
          </div>
        ),
        depth: block.depth,
        key: `media-gallery-${block.id}`,
        type: "other",
      });
      continue;
    }
    if (block.type !== "section") {
      units.push({
        content: renderContentBlock(block, context),
        depth: block.depth,
        key: block.id,
        type: "other",
      });
      continue;
    }

    const children: ContentBlock[] = [];
    while (
      (document.blocks[index + 1]?.type === "detail" ||
        document.blocks[index + 1]?.type === "register-entry") &&
      document.blocks[index + 1]?.parent === block.id
    ) {
      children.push(document.blocks[index + 1]);
      index += 1;
    }
    if (children.length === 0) {
      units.push({
        content: renderContentBlock(block, context),
        depth: block.depth,
        key: block.id,
        type: "section",
      });
      continue;
    }
    const hasRegisterEntries = children.some((child) => child.type === "register-entry");
    const crossesVisibleDepthBoundary =
      (block.depth === "intermediate" || block.depth === "advanced") &&
      children.some((child) => child.depth !== block.depth);

    if (crossesVisibleDepthBoundary) {
      units.push({
        content: renderContentBlock(block, context),
        depth: block.depth,
        key: block.id,
        type: "section",
      });
      units.push({
        content: renderSectionChildren(children, context),
        depth: null,
        key: `${block.id}-deeper-details`,
        type: "other",
      });
      continue;
    }

    units.push({
      content: (
        <div
          className={`content-section-group${hasRegisterEntries ? " content-register-group" : ""}`}
        >
          {renderContentBlock(block, context)}
          {renderSectionChildren(children, context)}
        </div>
      ),
      depth: block.depth,
      key: block.id,
      type: "section",
    });
  }

  const contentItems: ReactNode[] = [];
  for (let index = 0; index < units.length; index += 1) {
    const unit = units[index];
    if (unit.type !== "section" || (unit.depth !== "intermediate" && unit.depth !== "advanced")) {
      contentItems.push(<Fragment key={unit.key}>{unit.content}</Fragment>);
      continue;
    }

    const run = [unit];
    while (units[index + 1]?.type === "section" && units[index + 1]?.depth === unit.depth) {
      run.push(units[index + 1]);
      index += 1;
    }
    contentItems.push(
      <div
        className={`content-depth-section-run content-depth-${unit.depth}`}
        data-depth-run={unit.depth}
        key={`depth-run-${unit.key}`}
      >
        {renderDepthMarker(unit.depth, locale)}
        <div className="content-depth-section-run-body">
          {run.map((runUnit) => (
            <Fragment key={runUnit.key}>{runUnit.content}</Fragment>
          ))}
        </div>
      </div>,
    );
  }

  return <div className="content-document">{contentItems}</div>;
}
