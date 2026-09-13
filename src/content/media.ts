import type { ContentDocument, MediaAsset } from "./model";

export function mediaIdsForDocument(document: ContentDocument): string[] {
  return Array.from(
    new Set(document.blocks.flatMap((block) => (block.media_id ? [block.media_id] : []))),
  );
}

export function mediaUrl(asset: MediaAsset): string {
  const baseUrl = process.env.MEDIA_BASE_URL?.replace(/\/+$/, "");
  const version = asset.checksum_sha256 ? `?v=${asset.checksum_sha256.slice(0, 12)}` : "";
  return baseUrl
    ? `${baseUrl}/${asset.storage_key}${version}`
    : `/media/${asset.storage_key}${version}`;
}
