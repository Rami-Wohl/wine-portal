# Media working files

This directory is for editable illustration/diagram source files and generated
map exports, not for assets referenced directly by content.

Canonical media metadata lives under `data/media/`. The current local delivery
adapter reads registered bytes from `public/media/<storage_key>`. Markdown uses
only the stable media ID, so a later CDN migration does not change content.

`generated-map-exports/` is output only. Verified coordinates and boundaries
belong under `data/geography/`, never in a rendered image.
