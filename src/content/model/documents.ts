import { type Depth } from "./common";

export const CONTENT_BLOCK_TYPES = [
  "summary",
  "objectives",
  "section",
  "detail",
  "key-idea",
  "caveat",
  "in-the-glass",
  "comparison",
  "figure",
  "register-entry",
] as const;

export const CAVEAT_VARIANTS = ["simplification", "uncertainty", "exception"] as const;

export type ContentBlockType = (typeof CONTENT_BLOCK_TYPES)[number];

export type CaveatVariant = (typeof CAVEAT_VARIANTS)[number];

export interface ContentTextNode {
  type: "text";
  value: string;
}

export interface ContentInlineCodeNode {
  type: "inline-code";
  value: string;
}

export interface ContentEntityLinkNode {
  type: "entity-link";
  entity_id: string;
  label: string | null;
}

export interface ContentCitationNode {
  type: "citation";
  source_id: string;
  locator: string | null;
}

export interface ContentInlineContainerNode {
  type: "emphasis" | "strong";
  children: ContentInlineNode[];
}

export interface ContentLinkNode {
  type: "link";
  url: string;
  title: string | null;
  children: ContentInlineNode[];
}

export interface ContentBreakNode {
  type: "break";
}

export type ContentInlineNode =
  | ContentTextNode
  | ContentInlineCodeNode
  | ContentEntityLinkNode
  | ContentCitationNode
  | ContentInlineContainerNode
  | ContentLinkNode
  | ContentBreakNode;

export interface ContentParagraphNode {
  type: "paragraph";
  children: ContentInlineNode[];
}

export interface ContentHeadingNode {
  type: "heading";
  depth: 2 | 3;
  children: ContentInlineNode[];
}

export interface ContentListItemNode {
  type: "list-item";
  children: ContentBlockNode[];
}

export interface ContentListNode {
  type: "list";
  ordered: boolean;
  start: number | null;
  children: ContentListItemNode[];
}

export interface ContentBlockquoteNode {
  type: "blockquote";
  children: ContentBlockNode[];
}

export interface ContentTableNode {
  type: "table";
  align: Array<"left" | "right" | "center" | null>;
  rows: ContentInlineNode[][][];
}

export type ContentBlockNode =
  | ContentParagraphNode
  | ContentHeadingNode
  | ContentListNode
  | ContentBlockquoteNode
  | ContentTableNode;

export interface ContentBlock {
  id: string;
  type: ContentBlockType;
  depth: Depth | null;
  parent: string | null;
  source_refs: string[];
  variant: CaveatVariant | null;
  media_id: string | null;
  nodes: ContentBlockNode[];
}

export interface ContentDocument {
  blocks: ContentBlock[];
}
