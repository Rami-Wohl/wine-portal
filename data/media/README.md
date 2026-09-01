# Media records

Each YAML file is a canonical, provider-independent media record. Content uses
only its stable `media.*` ID in a bodyless `figure` block. Never put a local path
or CDN URL in authored Markdown.

The current asset bytes live at `public/media/<storage_key>`. Keep the storage
key stable, record both image dimensions, and update `checksum_sha256` whenever
the bytes change. `npm run content:check` validates the schema, references,
local file, and checksum.

`MEDIA_BASE_URL` changes delivery from `/media/<storage_key>` to
`<base>/<storage_key>`. When a storage provider is selected, its ingest/CI
adapter must upload and verify these same keys and checksums before deployment;
that provider-specific step must not rewrite content or media records.

Required editorial fields include localized alt text, semantic role, creator,
source page, rights status, license, credit line, and acquisition date. Factual
maps remain derived from verified geography, never from a photo or generated
illustration.
