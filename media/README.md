# Media working files

This directory is for editable illustration/diagram source files and generated
map exports, not for assets referenced directly by content.

Canonical media metadata lives under `data/media/`. The current local delivery
adapter reads registered bytes from `public/media/<storage_key>`. Markdown uses
only the stable media ID, so a later CDN migration does not change content.

Conceptual illustrations require editorial review; diagram labels and claims
must support localization. Follow [visual language](../docs/visual-language.md)
for the current visual contract. Create working subdirectories only when actual
source files need them.

Generated map exports are output only. Verified coordinates and boundaries
belong under `data/geography/`, never in a rendered image.
