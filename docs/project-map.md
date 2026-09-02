# Project map

Oenocademy is een greenfield, Dutch-first wijnkennisplatform. We bouwen nieuwe,
gecontroleerde content volgens de huidige entity-first architectuur; er is geen
ouder curriculum dat eerst hoeft te worden omgezet.

Dit document is de korte mentale kaart. De bindende policies bevatten de
details en blijven leidend wanneer een taak meer precisie nodig heeft.

## De kern in één beeld

```text
authored en canonical

  entity.yaml + content-plan.yaml + overview.nl.md + overview.en.md
  narrative.yaml + article.nl.md + article.en.md
  source records + media records + verified geography
                         |
                         | content:check / content:build
                         v
generated en vervangbaar

  src/generated/content/knowledge-base.json
                         |
                         v
applicatie

  repository -> routes -> React-renderer -> Explore / Verdiepingen / Learn / Atlas
```

YAML beschrijft wat iets is en hoe het verbonden is. Markdown legt dezelfde
kennis per taal uit aan een mens. De gegenereerde JSON-bundel brengt deze inputs
samen voor de applicatie en wordt nooit handmatig bewerkt.

## Waar leeft welke waarheid?

| Onderwerp | Canonical locatie | Rol |
| --- | --- | --- |
| Entity-identiteit, relaties en assertions | `content/entities/**/entity.yaml` | Gedeelde, taaloverstijgende kennis |
| Dekkingsplan en dependency-inventaris | `content/entities/**/content-plan.yaml` | Afdwingbaar redactioneel contract voor grote overzichten; niet in de runtimebundle |
| Entity-uitleg | `content/entities/**/overview.<locale>.md` | Gelokaliseerde presentatie |
| Narrative-metadata en entitykoppelingen | `content/narratives/**/narrative.yaml` | Identiteit, scope en relaties van een verhaal |
| Narrative-artikel | `content/narratives/**/article.<locale>.md` | Gelokaliseerde uitleg over meerdere entities |
| Herbruikbare bronnen | `data/sources/` | Provenance voor claims en contentblocks |
| Mediametadata | `data/media/` | Stabiele media-ID, opslagkey, afmetingen, alttekst en rechten |
| Lokale mediabytes | `public/media/` | Huidige opslagadapter; later vervangbaar door object storage/CDN |
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

Narratives wonen canoniek onder `/verdiepingen/<type>/<slug>`. Alleen narratives
van type `lesson` worden in Learn aangeboden. Een toekomstig learning path is een
geordende route langs bestaande content en wordt niet de eigenaar van die content.

Learning paths worden later geordende routes door bestaande entities en
narratives. Ze worden geen aparte opslagplaats voor gekopieerde wijnkennis.

NL en EN zijn beide verplichte, gevalideerde authoringlagen. De huidige publieke
interface en routes zijn uitsluitend Nederlands. Engelse presentatie is een
bewuste volgende productstap, geen al werkende feature of automatische fallback.

## Dagelijkse contentworkflow

1. Maak voor een grote overzichtspagina eerst de contentbrief, dekkingsmatrix en
   sectievragen; leg de goedgekeurde uitkomst vast in `content-plan.yaml`.
2. Inventariseer alle zelfstandig vindbare, herbruikbare dependencies en maak de
   ontbrekende draftpackages in één batch aan.
3. Verzamel geschikte bronnen en registreer herbruikbare bronnen onder
   `data/sources/`.
4. Leg identiteit, relaties, assertions en provenance in YAML vast.
5. Schrijf de Nederlandse Markdown volgens `content-blocks.md` en herhaal per
   sectie de volledigheidscontrole totdat alle scopevragen zijn beantwoord of
   expliciet zijn uitbesteed.
6. Schrijf en review de Engelse lokalisatie met dezelfde kennis en blockstructuur.
7. Registreer beelden onder `data/media/` en verwijs vanuit Markdown alleen met `media_id`.
8. Draai `npm run content:check` en `npm run content:link-audit` tijdens het authoren.
9. Draai relevante unit- en browsertests wanneer routes, rendering of layouts
   zijn geraakt.
10. Review inhoud, bronnen, mediarechten, onzekerheid, responsive presentatie en publicatiestatus.

`draft` blijft beschikbaar voor redactionele review, maar verschijnt niet in
Explore, search, publieke backlinks of de sitemap. Alleen `active` content wordt
via die publieke overzichten ontdekt.

Lokaal wordt een storage key als `/media/<key>` geleverd. Bij een latere CDN
stelt deployment `MEDIA_BASE_URL` in en synchroniseert een provideradapter
dezelfde keys automatisch. Contentbestanden en mediarecords bevatten daarom
nooit provider-URL's en hoeven bij die overgang niet te worden herschreven.

`region.bordeaux` is de eerste actieve, onderzochte overzichtsentity. De gelinkte
Bordeauxpackages vormen bewuste draftbestemmingen voor volgende authoringrondes:
hun identiteit en routes bestaan al, hun inhoud wordt pas actief na eigen
onderzoek en review. Zij worden niet uit een oud curriculum geconverteerd.

## Welk commando doet wat?

| Commando | Gebruik |
| --- | --- |
| `npm run content:new -- <type> <slug>` | Maakt een leeg entitypackage zonder wijnfeiten |
| `npm run content:deps -- scaffold <entity-id>` | Maakt alle ontbrekende dependencies uit het contentplan als lege drafts |
| `npm run content:check` | Valideert authored content en schrijft niets |
| `npm run content:link-audit` | Zoekt bekende entitynamen die in proza staan maar nog niet zijn gelinkt |
| `npm run content:build` | Valideert en genereert de runtimebundle |
| `npm run content:status` | Vernieuwt `docs/entity-status.md` vanuit alle canonical entity-YAML |
| `npm run format` | Format code, CSS, JSON en YAML met de vastgepinde Prettier-versie |
| `npm run format:check` | Controleert die formatting zonder bestanden te wijzigen |
| `npm run check` | Draait formattingcheck, lint, typecheck en unit-tests |
| `npm test` | Test parser, graph, routing, search en rendererlogica snel |
| `npm run test:e2e` | Test een kleine kritieke keten in een echte browser |

Browsertests zijn bedoeld voor integratiegrenzen zoals routing, gelokaliseerde
content, draftgedrag, links, rendering en responsive overflow. Ze controleren
niet ieder wijnfeit en hoeven niet na iedere kleine tekstwijziging te draaien.

Markdown valt bewust buiten Prettier: de eigen contentblock-directives worden
door de contentpipeline gevalideerd en mogen niet door een algemene
Markdownformatter worden herschreven.

## Welke documentatie heb je wanneer nodig?

- Begin hier voor oriëntatie.
- Gebruik `content-authoring.md` tijdens het aanmaken en vullen van packages.
- Gebruik `content-blocks.md` voor Markdownsyntax en rendererconventies.
- Gebruik `../editorial/research-policy.md` voor iedere feitelijke claim, bron,
  vertaling of correctie.
- Gebruik `../editorial/writing-style.md` voor stem, regiopagina's en levendige
  maar precieze redactie.
- Gebruik `knowledge-architecture.md` wanneer het model, relaties, routing,
  indexing of canonical ownership verandert.
- Gebruik `geography-policy.md` voor plaatsen, coördinaten, grenzen en Atlas.
- Gebruik `visual-language.md` voor UI, responsive gedrag en visuals.

Lees dus niet standaard ieder beleidsdocument voor iedere taak. Kies de
documenten die daadwerkelijk door de wijziging worden geraakt.
