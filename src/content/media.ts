import type { ContentDocument, MediaAsset } from "./model";

export function mediaIdsForDocument(document: ContentDocument): string[] {
  return Array.from(new Set(
    document.blocks.flatMap((block) => block.media_id ? [block.media_id] : []),
  ));
}

export function mediaUrl(asset: MediaAsset): string {
  const baseUrl = process.env.MEDIA_BASE_URL?.replace(/\/+$/, "");
  return baseUrl ? `${baseUrl}/${asset.storage_key}` : `/media/${asset.storage_key}`;
}
