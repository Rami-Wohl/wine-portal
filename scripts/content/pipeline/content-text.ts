import type { ContentInlineNode, ContentBlockNode } from "../../../src/content/model";

export function inlineText(
  nodes: ContentInlineNode[],
  entityLabel: (id: string) => string = (id) => id,
): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
        case "inline-code":
          return node.value;
        case "entity-link":
          return node.label ?? entityLabel(node.entity_id);
        case "citation":
          return "";
        case "emphasis":
        case "strong":
        case "link":
          return inlineText(node.children, entityLabel);
        case "break":
          return " ";
      }
    })
    .join("")
    .trim();
}

export function blockNodeText(node: ContentBlockNode, entityLabel: (id: string) => string): string {
  switch (node.type) {
    case "paragraph":
    case "heading":
      return inlineText(node.children, entityLabel);
    case "list":
      return node.children
        .flatMap((item) => item.children.map((child) => blockNodeText(child, entityLabel)))
        .join(" ");
    case "blockquote":
      return node.children.map((child) => blockNodeText(child, entityLabel)).join(" ");
    case "table":
      return node.rows.flatMap((row) => row.map((cell) => inlineText(cell, entityLabel))).join(" ");
  }
}
