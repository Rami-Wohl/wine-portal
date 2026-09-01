import type {
  BlockContent,
  ListItem,
  PhrasingContent,
  RootContent,
  Table,
} from "mdast";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import {
  CAVEAT_VARIANTS,
  CONTENT_BLOCK_TYPES,
  DEPTHS,
  entityIdPattern,
  mediaIdSchema,
  sourceIdSchema,
  type CaveatVariant,
  type ContentBlock,
  type ContentBlockNode,
  type ContentBlockType,
  type ContentCitationNode,
  type ContentDocument,
  type ContentInlineNode,
  type Depth,
  type Locale,
  type NarrativeMention,
} from "../../src/content/model";

const blockIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const allowedAttributes = new Set(["id", "depth", "source_refs", "variant", "media_id"]);

export interface ParsedContentDocument {
  document: ContentDocument;
  mentions: NarrativeMention[];
  citations: ContentCitationNode[];
  issues: string[];
}

interface ParseState {
  file: string;
  locale: Locale;
  issues: string[];
  mentions: NarrativeMention[];
  citations: ContentCitationNode[];
}

function issue(state: ParseState, message: string): void {
  state.issues.push(`${state.file}: ${message}`);
}

function parseText(value: string, state: ParseState): ContentInlineNode[] {
  const nodes: ContentInlineNode[] = [];
  let cursor = 0;

  const pushText = (text: string) => {
    if (text.length > 0) nodes.push({ type: "text", value: text });
  };

  while (cursor < value.length) {
    const entityStart = value.indexOf("[[", cursor);
    const citationStart = value.indexOf("[@", cursor);
    const starts = [entityStart, citationStart].filter((start) => start >= 0);
    if (starts.length === 0) {
      pushText(value.slice(cursor));
      break;
    }

    const start = Math.min(...starts);
    pushText(value.slice(cursor, start));

    if (start === entityStart) {
      const end = value.indexOf("]]", start + 2);
      if (end < 0) {
        issue(state, `unclosed entity link starting in '${value.slice(start)}'`);
        pushText(value.slice(start));
        break;
      }
      const body = value.slice(start + 2, end);
      const parts = body.split("|");
      const entityId = parts[0];
      const label = parts.length === 2 ? parts[1] : null;
      if (
        parts.length > 2 ||
        !entityIdPattern.test(entityId) ||
        (label !== null && label.trim().length === 0)
      ) {
        issue(
          state,
          `invalid entity link '[[${body}]]'; use [[entity.id]] or [[entity.id|Label]]`,
        );
        pushText(value.slice(start, end + 2));
      } else {
        nodes.push({ type: "entity-link", entity_id: entityId, label });
        state.mentions.push({ entity_id: entityId, label, locale: state.locale });
      }
      cursor = end + 2;
      continue;
    }

    const end = value.indexOf("]", start + 2);
    if (end < 0) {
      issue(state, `unclosed citation starting in '${value.slice(start)}'`);
      pushText(value.slice(start));
      break;
    }
    const body = value.slice(start + 2, end);
    const separator = body.indexOf(";");
    const sourceId = (separator < 0 ? body : body.slice(0, separator)).trim();
    const locator = separator < 0 ? null : body.slice(separator + 1).trim();
    const sourceResult = sourceIdSchema.safeParse(sourceId);
    if (!sourceResult.success || (separator >= 0 && locator?.length === 0)) {
      issue(
        state,
        `invalid citation '[@${body}]'; use [@source.id] or [@source.id; locator]`,
      );
      pushText(value.slice(start, end + 1));
    } else {
      const citation: ContentCitationNode = {
        type: "citation",
        source_id: sourceId,
        locator,
      };
      nodes.push(citation);
      state.citations.push(citation);
    }
    cursor = end + 1;
  }

  return nodes;
}

function normalizeInline(
  nodes: PhrasingContent[],
  state: ParseState,
): ContentInlineNode[] {
  return nodes.flatMap((node): ContentInlineNode[] => {
    switch (node.type) {
      case "text":
        return parseText(node.value, state);
      case "emphasis":
      case "strong":
        return [{ type: node.type, children: normalizeInline(node.children, state) }];
      case "inlineCode":
        return [{ type: "inline-code", value: node.value }];
      case "break":
        return [{ type: "break" }];
      case "link": {
        const allowed = /^(?:https?:|mailto:|\/|#)/.test(node.url);
        if (!allowed) {
          issue(state, `link URL '${node.url}' must be http(s), mailto, root-relative, or an anchor`);
          return normalizeInline(node.children, state);
        }
        return [{
          type: "link",
          url: node.url,
          title: node.title ?? null,
          children: normalizeInline(node.children, state),
        }];
      }
      default:
        issue(state, `unsupported inline Markdown node '${node.type}'`);
        return [];
    }
  });
}

function normalizeTable(node: Table, state: ParseState): ContentBlockNode {
  return {
    type: "table",
    align: node.align ?? [],
    rows: node.children.map((row) =>
      row.children.map((cell) => normalizeInline(cell.children, state)),
    ),
  };
}

function normalizeListItem(node: ListItem, state: ParseState) {
  return {
    type: "list-item" as const,
    children: normalizeBlocks(node.children, state),
  };
}

function normalizeBlocks(
  nodes: Array<BlockContent | RootContent>,
  state: ParseState,
): ContentBlockNode[] {
  return nodes.flatMap((node): ContentBlockNode[] => {
    switch (node.type) {
      case "paragraph":
        return [{ type: "paragraph", children: normalizeInline(node.children, state) }];
      case "heading":
        if (node.depth !== 2 && node.depth !== 3) {
          issue(state, `heading level H${node.depth} is not allowed; use H2 or H3`);
          return [];
        }
        return [{
          type: "heading",
          depth: node.depth,
          children: normalizeInline(node.children, state),
        }];
      case "list":
        return [{
          type: "list",
          ordered: node.ordered ?? false,
          start: node.start ?? null,
          children: node.children.map((child) => normalizeListItem(child, state)),
        }];
      case "blockquote":
        return [{ type: "blockquote", children: normalizeBlocks(node.children, state) }];
      case "table":
        return [normalizeTable(node, state)];
      default:
        issue(state, `unsupported Markdown node '${node.type}'`);
        return [];
    }
  });
}

function hasCitation(nodes: ContentBlockNode[]): boolean {
  const inlineHasCitation = (inline: ContentInlineNode[]): boolean =>
    inline.some((node) =>
      node.type === "citation" ||
      ((node.type === "emphasis" || node.type === "strong" || node.type === "link") &&
        inlineHasCitation(node.children)),
    );

  return nodes.some((node) => {
    if (node.type === "paragraph" || node.type === "heading") {
      return inlineHasCitation(node.children);
    }
    if (node.type === "blockquote") return hasCitation(node.children);
    if (node.type === "list") {
      return node.children.some((item) => hasCitation(item.children));
    }
    return node.rows.some((row) => row.some((cell) => inlineHasCitation(cell)));
  });
}

function validateBlockShape(block: ContentBlock, state: ParseState): void {
  const headings = block.nodes.filter((node) => node.type === "heading");
  if (block.type === "summary") {
    if (
      block.nodes.length < 1 ||
      block.nodes.length > 2 ||
      block.nodes.some((node) => node.type !== "paragraph")
    ) {
      issue(state, `summary '${block.id}' must contain one or two paragraphs only`);
    }
  }
  if (block.type === "objectives") {
    const [list] = block.nodes;
    if (
      block.nodes.length !== 1 ||
      !list ||
      list.type !== "list" ||
      list.ordered
    ) {
      issue(state, `objectives '${block.id}' must contain one unordered list`);
    }
  }
  if (block.type === "section" || block.type === "comparison") {
    const [first] = block.nodes;
    if (!first || first.type !== "heading" || first.depth !== 2) {
      issue(state, `${block.type} '${block.id}' must start with an H2`);
    }
  } else if (headings.length > 0) {
    issue(state, `${block.type} '${block.id}' must not contain headings`);
  }
  if (block.type === "caveat" && block.variant === null) {
    issue(state, `caveat '${block.id}' requires a variant`);
  }
  if (block.type === "figure") {
    if (block.media_id === null) {
      issue(state, `figure '${block.id}' requires a media_id`);
    }
    if (block.nodes.length > 0) {
      issue(state, `figure '${block.id}' must not contain Markdown content`);
    }
  } else if (block.media_id !== null) {
    issue(state, `only figure blocks may use media_id`);
  }
  for (const node of block.nodes) {
    if (node.type === "blockquote" && !hasCitation(node.children)) {
      issue(state, `blockquote in '${block.id}' requires a citation`);
    }
  }
}

export function parseContentDocument(
  markdown: string,
  file: string,
  locale: Locale,
): ParsedContentDocument {
  const state: ParseState = { file, locale, issues: [], mentions: [], citations: [] };
  const root = unified()
    .use(remarkParse)
    .use(remarkDirective)
    .use(remarkGfm)
    .parse(markdown);
  const blocks: ContentBlock[] = [];
  const seenIds = new Set<string>();

  for (const child of root.children) {
    if (child.type !== "containerDirective") {
      issue(state, `content must consist only of top-level container directives; found '${child.type}'`);
      continue;
    }
    if (!CONTENT_BLOCK_TYPES.includes(child.name as ContentBlockType)) {
      issue(state, `unknown content block '${child.name}'`);
      continue;
    }

    const type = child.name as ContentBlockType;
    const attributes = child.attributes ?? {};
    for (const attribute of Object.keys(attributes)) {
      if (!allowedAttributes.has(attribute)) {
        issue(state, `${type} uses unknown attribute '${attribute}'`);
      }
    }

    const id = attributes.id ?? "";
    if (!blockIdPattern.test(id)) {
      issue(state, `${type} requires one lowercase kebab-case #id`);
    } else if (seenIds.has(id)) {
      issue(state, `duplicate content block ID '${id}'`);
    }
    seenIds.add(id);

    const depthValue = attributes.depth ?? null;
    const depth = depthValue && DEPTHS.includes(depthValue as Depth)
      ? depthValue as Depth
      : null;
    if (depthValue && depth === null) {
      issue(state, `${type} '${id}' has unsupported depth '${depthValue}'`);
    }

    const sourceRefs = (attributes.source_refs ?? "")
      .split(/\s+/)
      .filter(Boolean);
    for (const sourceRef of sourceRefs) {
      if (!sourceIdSchema.safeParse(sourceRef).success) {
        issue(state, `${type} '${id}' has invalid source reference '${sourceRef}'`);
      }
    }
    if (new Set(sourceRefs).size !== sourceRefs.length) {
      issue(state, `${type} '${id}' repeats a source reference`);
    }

    const variantValue = attributes.variant ?? null;
    const variant = variantValue && CAVEAT_VARIANTS.includes(variantValue as CaveatVariant)
      ? variantValue as CaveatVariant
      : null;
    if (variantValue && variant === null) {
      issue(state, `${type} '${id}' has unsupported caveat variant '${variantValue}'`);
    }
    if (type !== "caveat" && variantValue) {
      issue(state, `only caveat blocks may use the variant attribute`);
    }

    const mediaIdValue = attributes.media_id ?? null;
    const mediaId = mediaIdValue && mediaIdSchema.safeParse(mediaIdValue).success
      ? mediaIdValue
      : null;
    if (mediaIdValue && mediaId === null) {
      issue(state, `${type} '${id}' has invalid media ID '${mediaIdValue}'`);
    }

    const citationStart = state.citations.length;
    const nodes = normalizeBlocks(child.children, state);
    for (const citation of state.citations.slice(citationStart)) {
      if (!sourceRefs.includes(citation.source_id)) {
        issue(
          state,
          `${type} '${id}' cites '${citation.source_id}' without listing it in source_refs`,
        );
      }
    }

    const block: ContentBlock = {
      id,
      type,
      depth,
      source_refs: sourceRefs,
      variant,
      media_id: mediaId,
      nodes,
    };
    validateBlockShape(block, state);
    blocks.push(block);
  }

  return {
    document: { blocks },
    mentions: state.mentions,
    citations: state.citations,
    issues: state.issues,
  };
}

export function validateLocaleParity(
  documents: Record<Locale, ContentDocument>,
  file: string,
): string[] {
  const left = documents.nl.blocks;
  const right = documents.en.blocks;
  const issues: string[] = [];
  if (left.length !== right.length) {
    issues.push(`${file}: NL and EN must contain the same number of content blocks`);
    return issues;
  }
  for (let index = 0; index < left.length; index += 1) {
    const nl = left[index];
    const en = right[index];
    for (const field of ["id", "type", "depth", "variant", "media_id"] as const) {
      if (nl[field] !== en[field]) {
        issues.push(
          `${file}: NL/EN block ${index + 1} differs in ${field} ('${String(nl[field])}' vs '${String(en[field])}')`,
        );
      }
    }
  }
  return issues;
}

export function validatePublicationStructure(
  document: ContentDocument,
  file: string,
  kind: "entity" | "narrative",
  narrativeType?: string,
): string[] {
  const blocks = document.blocks;
  const issues: string[] = [];
  const count = (type: ContentBlockType) =>
    blocks.filter((block) => block.type === type).length;

  if (count("summary") !== 1 || blocks[0]?.type !== "summary") {
    issues.push(`${file}: active ${kind} must start with exactly one summary block`);
  }
  if (kind === "narrative" && count("section") < 1) {
    issues.push(`${file}: active narrative requires at least one section block`);
  }
  if (kind === "narrative" && narrativeType === "lesson") {
    const objectiveIndex = blocks.findIndex((block) => block.type === "objectives");
    const sectionIndex = blocks.findIndex((block) => block.type === "section");
    if (count("objectives") !== 1 || objectiveIndex < 0 || objectiveIndex > sectionIndex) {
      issues.push(`${file}: active lesson requires one objectives block before its first section`);
    }
    if (count("key-idea") < 1) {
      issues.push(`${file}: active lesson requires at least one key-idea block`);
    }
    if (count("in-the-glass") < 1) {
      issues.push(`${file}: active lesson requires at least one in-the-glass block`);
    }
  }
  return issues;
}
