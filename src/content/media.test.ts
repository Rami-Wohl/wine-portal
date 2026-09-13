import { afterEach, describe, expect, it, vi } from "vitest";
import type { ContentDocument, MediaAsset } from "./model";
import { mediaIdsForDocument, mediaUrl } from "./media";

const asset = {
  storage_key: "bordeaux/saint-emilion.jpg",
} as MediaAsset;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("media delivery", () => {
  it("uses the local public adapter by default", () => {
    vi.stubEnv("MEDIA_BASE_URL", "");
    expect(mediaUrl(asset)).toBe("/media/bordeaux/saint-emilion.jpg");
  });

  it("keeps the storage key stable when delivery moves to a CDN", () => {
    vi.stubEnv("MEDIA_BASE_URL", "https://cdn.example.com/oenocademy/");
    expect(mediaUrl(asset)).toBe("https://cdn.example.com/oenocademy/bordeaux/saint-emilion.jpg");
  });

  it("versions replaced assets by their checksum", () => {
    vi.stubEnv("MEDIA_BASE_URL", "");
    expect(
      mediaUrl({
        ...asset,
        checksum_sha256: "abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      }),
    ).toBe("/media/bordeaux/saint-emilion.jpg?v=abcdef123456");
  });

  it("collects unique media IDs from a localized document", () => {
    const document = {
      blocks: [
        { media_id: "media.example.first" },
        { media_id: null },
        { media_id: "media.example.first" },
        { media_id: "media.example.second" },
      ],
    } as ContentDocument;

    expect(mediaIdsForDocument(document)).toEqual(["media.example.first", "media.example.second"]);
  });
});
