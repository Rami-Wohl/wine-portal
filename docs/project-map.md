# Project map

Oenocademy is een greenfield, Dutch-first wijnkennisplatform. We bouwen nieuwe,
gecontroleerde content volgens de huidige entity-first architectuur; er is geen
ouder curriculum dat eerst hoeft te worden omgezet.

Dit document is de korte mentale kaart. De bindende policies bevatten de
details en blijven leidend wanneer een taak meer precisie nodig heeft.

## De kern in één beeld

```text
authored en canonical

  entity.yaml + overview.nl.md + overview.en.md
  narrative.yaml + article.nl.md + article.en.md
  source records + verified geography
                         |
                         | content:check / content:build
                         v
generated en vervangbaar

  src/generated/content/knowledge-base.json
                         |
                         v
applicatie

  repository -> routes -> React-renderer -> Explore / Learn / Atlas
```

YAML beschrijft wat iets is en hoe het verbonden is. Markdown legt dezelfde
kennis per taal uit aan een mens. De gegenereerde JSON-bundel brengt deze inputs
samen voor de applicatie en wordt nooit handmatig bewerkt.

## Waar leeft welke waarheid?

| Onderwerp | Canonical locatie | Rol |
| --- | --- | --- |
| Entity-identiteit, relaties en assertions | `content/entities/**/entity.yaml` | Gedeelde, taaloverstijgende kennis |
| Entity-uitleg | `content/entities/**/overview.<locale>.md` | Gelokaliseerde presentatie |
| Narrative-metadata en entitykoppelingen | `content/narratives/**/narrative.yaml` | Identiteit, scope en relaties van een verhaal |
| Narrative-artikel | `content/narratives/**/article.<locale>.md` | Gelokaliseerde uitleg over meerdere entities |
| Herbruikbare bronnen | `data/sources/` | Provenance voor claims en contentblocks |
| Geverifieerde geografie | `data/geography/` | Toekomstige factual Atlasdata |
| Runtimebundle | `src/generated/content/knowledge-base.json` | Afgeleid buildresultaat, niet canonical |
| Pagina's en componenten | `src/` | Presentatie en interactie, geen tweede feitenbron |

Een stabiel feit heeft één canonical eigenaar. Narratives en pagina's mogen dat
feit uitleggen, maar onderhouden geen parallelle structurele kopie.

## Entity versus narrative

Een entity is een zelfstandig kennisobject, bijvoorbeeld Bordeaux, Pauillac of
Cabernet Sauvignon. Het package combineert gedeelde YAML-data met Nederlandse
en Engelse overview-Markdown.

Een narrative is een les, verdieping of verhaal dat door meerdere entities
heen loopt. Het verwijst met stable IDs naar entities. De pipeline leidt daar
mentions en backlinks uit af; auteurs hardcoderen geen applicatieroutes.

Learning paths worden later geordende routes door bestaande entities en
narratives. Ze worden geen aparte opslagplaats voor gekopieerde wijnkennis.

## Dagelijkse contentworkflow

1. Kies een afgebakend onderwerp en bepaal welke entities en narrative nodig
   zijn.
2. Verzamel geschikte bronnen en registreer herbruikbare bronnen onder
   `data/sources/`.
3. Leg identiteit, relaties, assertions en provenance in YAML vast.
4. Schrijf de Nederlandse Markdown volgens `content-blocks.md`.
5. Schrijf en review de Engelse lokalisatie met dezelfde kennis en blockstructuur.
6. Draai `npm run content:check` tijdens het authoren.
7. Draai relevante unit- en browsertests wanneer routes, rendering of layouts
   zijn geraakt.
8. Review inhoud, bronnen, onzekerheid, responsive presentatie en publicatiestatus.

De huidige Bordeauxpackages zijn draft technische fixtures. De eerste echte
contentslice vervangt hun fixturetekst stapsgewijs door onderzochte canonical
content; zij wordt niet uit een oud curriculum geconverteerd.

## Welk commando doet wat?

| Commando | Gebruik |
| --- | --- |
| `npm run content:new -- <type> <slug>` | Maakt een leeg entitypackage zonder wijnfeiten |
| `npm run content:check` | Valideert authored content en schrijft niets |
| `npm run content:build` | Valideert en genereert de runtimebundle |
| `npm test` | Test parser, graph, routing, search en rendererlogica snel |
| `npm run test:e2e` | Test een kleine kritieke keten in een echte browser |

Browsertests zijn bedoeld voor integratiegrenzen zoals routing, gelokaliseerde
content, draftgedrag, links, rendering en responsive overflow. Ze controleren
niet ieder wijnfeit en hoeven niet na iedere kleine tekstwijziging te draaien.

## Welke documentatie heb je wanneer nodig?

- Begin hier voor oriëntatie.
- Gebruik `content-authoring.md` tijdens het aanmaken en vullen van packages.
- Gebruik `content-blocks.md` voor Markdownsyntax en rendererconventies.
- Gebruik `../editorial/research-policy.md` voor iedere feitelijke claim, bron,
  vertaling of correctie.
- Gebruik `knowledge-architecture.md` wanneer het model, relaties, routing,
  indexing of canonical ownership verandert.
- Gebruik `geography-policy.md` voor plaatsen, coördinaten, grenzen en Atlas.
- Gebruik `visual-language.md` voor UI, responsive gedrag en visuals.

Lees dus niet standaard ieder beleidsdocument voor iedere taak. Kies de
documenten die daadwerkelijk door de wijziging worden geraakt.
