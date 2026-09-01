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
import { getEntityById } from "@/content/repository";
import { entityHref } from "@/content/routing";

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

interface RenderContext {
  locale: Locale;
  sources: Map<string, Source>;
  sourceNumbers: Map<string, number>;
  media: Map<string, MediaAsset>;
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
          <Link className="content-entity-link" href={entityHref(entity)} key={key}>
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

function renderContentBlock(block: ContentBlock, context: RenderContext): ReactNode {
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
      return (
        <figure {...common}>
          <Image
            alt={asset.alt[context.locale]}
            height={asset.height}
            sizes="(max-width: 620px) calc(100vw - 32px), 760px"
            src={mediaUrl(asset)}
            width={asset.width}
          />
          <figcaption>
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
    case "comparison":
      return <section {...common}>{content}</section>;
    case "detail":
      return (
        <div {...common} data-parent={block.parent ?? undefined}>
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

  const contentItems: ReactNode[] = [];
  for (let index = 0; index < document.blocks.length; index += 1) {
    const block = document.blocks[index];
    if (block.type !== "section") {
      contentItems.push(<Fragment key={block.id}>{renderContentBlock(block, context)}</Fragment>);
      continue;
    }

    const details: ContentBlock[] = [];
    while (
      document.blocks[index + 1]?.type === "detail" &&
      document.blocks[index + 1]?.parent === block.id
    ) {
      details.push(document.blocks[index + 1]);
      index += 1;
    }
    if (details.length === 0) {
      contentItems.push(<Fragment key={block.id}>{renderContentBlock(block, context)}</Fragment>);
      continue;
    }
    contentItems.push(
      <div className="content-section-group" key={block.id}>
        {renderContentBlock(block, context)}
        {details.map((detail) => (
          <Fragment key={detail.id}>{renderContentBlock(detail, context)}</Fragment>
        ))}
      </div>,
    );
  }

  return <div className="content-document">{contentItems}</div>;
}
