# Canonical content packages

Oenocademy stores canonical facts and localized writing together in self-contained packages:

```text
content/
├── entities/<entity-type>/<slug>/
│   ├── entity.yaml
│   ├── overview.nl.md
│   ├── overview.en.md
│   └── media/                 # only when specific to this entity
├── narratives/<type>/<slug>/
│   ├── narrative.yaml
│   ├── article.nl.md
│   ├── article.en.md
│   └── media/                 # only when specific to this narrative
└── legacy/modules/            # non-canonical migration input
```

YAML contains shared identity, relations, assertions, and provenance references. Markdown contains localized presentation. Reusable sources and verified geography remain under `data/`.

See `docs/content-authoring.md` for the authoring workflow and `scripts/content/README.md` for validation and generated output.
