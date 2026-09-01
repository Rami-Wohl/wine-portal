# Oenocademy

**Navigeer door de wereld van wijn.**

Oenocademy is een meertalig, entity-first kennisplatform voor wijn, gericht op zowel gestructureerd leren als vrij verkennen. Het platform verbindt Learn, Explore en een toekomstige geografische Atlas met gedeelde entities, narratives, kennisdiepte en bronprovenance.

## Development

Installeer dependencies en start de ontwikkelserver:

```bash
npm install
npm run dev
```

Open daarna [http://localhost:3000](http://localhost:3000).

## Content

Canonical content staat in `content/`. De contentpipeline valideert stable IDs en relaties en genereert afgeleide indexes zonder handmatig onderhouden backlinks.

Begin bij `docs/project-map.md` voor de korte mentale kaart van authored content,
generated output en applicatiecode.

```bash
npm run content:check
npm run content:build
npm run content:new -- producer example-estate
```

Zie daarna `docs/content-authoring.md`, `docs/content-blocks.md` en
`scripts/content/README.md` voor de authoringworkflow.

## Validation

```bash
npm run typecheck
npm run lint
npm test
```
