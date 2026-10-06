import { z } from "zod";
import { sourceIdSchema, mediaIdSchema, dateSchema, httpUrlSchema } from "./common";

export const MEDIA_KINDS = ["photo", "illustration", "diagram", "map"] as const;

export const MEDIA_ROLES = [
  "documentary",
  "representative",
  "educational",
  "schematic",
  "decorative",
] as const;

export const MEDIA_RIGHTS_STATUSES = [
  "open-licensed",
  "public-domain",
  "owned",
  "generated",
] as const;

export type MediaKind = (typeof MEDIA_KINDS)[number];

export type MediaRole = (typeof MEDIA_ROLES)[number];

export const sourceSchema = z
  .object({
    id: sourceIdSchema,
    source_type: z.enum([
      "regulator",
      "academic",
      "book",
      "trade-body",
      "producer",
      "critic",
      "journalism",
      "historical-document",
      "dataset",
    ]),
    publisher: z.string().min(1),
    title: z.string().min(1),
    url: httpUrlSchema.optional(),
    published_at: dateSchema.optional(),
    accessed_at: dateSchema.optional(),
    language: z.string().regex(/^[a-z]{2,3}$/),
    status: z.enum(["active", "unavailable", "deprecated"]),
  })
  .strict();

export const localizedMediaTextSchema = z.object({ nl: z.string(), en: z.string() }).strict();

export const mediaAssetSchema = z
  .object({
    id: mediaIdSchema,
    kind: z.enum(MEDIA_KINDS),
    role: z.enum(MEDIA_ROLES),
    status: z.enum(["draft", "active", "deprecated"]),
    storage_key: z
      .string()
      .regex(
        /^[a-z0-9]+(?:[/-][a-z0-9]+)*(?:\.[a-z0-9]+)+$/,
        "must be a lowercase relative storage key with a file extension",
      ),
    mime_type: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif", "image/svg+xml"]),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    checksum_sha256: z.string().regex(/^[a-f0-9]{64}$/, "must be a lowercase SHA-256 checksum"),
    alt: localizedMediaTextSchema,
    caption: localizedMediaTextSchema.optional(),
    rights: z
      .object({
        status: z.enum(MEDIA_RIGHTS_STATUSES),
        creator: z.string().min(1),
        source_url: httpUrlSchema.optional(),
        license_name: z.string().min(1),
        license_url: httpUrlSchema.optional(),
        credit_line: z.string().min(1),
      })
      .strict(),
    acquired_at: dateSchema,
    changes: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((asset, context) => {
    const altValues = [asset.alt.nl, asset.alt.en];
    if (asset.role === "decorative" && altValues.some((value) => value.length > 0)) {
      context.addIssue({
        code: "custom",
        path: ["alt"],
        message: "decorative media must use empty alt text in every locale",
      });
    }
    if (asset.role !== "decorative" && altValues.some((value) => value.trim().length === 0)) {
      context.addIssue({
        code: "custom",
        path: ["alt"],
        message: "non-decorative media requires alt text in every locale",
      });
    }
  });

export type Source = z.infer<typeof sourceSchema>;

export type MediaAsset = z.infer<typeof mediaAssetSchema>;
