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
npm run format
npm run check
```

Prettier is de repositoryformatter voor code, CSS, JSON en YAML. Markdown is
uitgesloten omdat canonical content eigen directives gebruikt die een algemene
Markdownformatter niet veilig begrijpt. De meegeleverde VS Code-instellingen
gebruiken dezelfde formatter automatisch bij opslaan. `npm run check` controleert
formatting, lint, types en unit-tests; draai daarnaast `npm run test:e2e` wanneer
een wijziging routing, rendering, responsive gedrag of een andere browserflow raakt.
