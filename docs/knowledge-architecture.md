---
title: "Knowledge architecture"
purpose: "Actieve content-, data-, provenance- en migratiearchitectuur voor Oenocademy"
status: "active"
version: "1.0"
created: "2026-08-25"
last_updated: "2026-08-31"
---

# Knowledge architecture

Oenocademy is een Dutch-first, meertalig en entity-first kennisplatform voor wijn. Deze architectuur beschrijft het geïmplementeerde v1-contract voor canonical content en de afgeleide knowledge graph. Waar dit document toekomstige mogelijkheden noemt, zijn die expliciet als **roadmap** gemarkeerd en geen huidig pipelinecontract.

## Status van v1

De v1-contentarchitectuur is geïmplementeerd:

- YAML-metadata en gelokaliseerde Markdown staan in self-contained entity- en narrativepackages;
- strikte schema's valideren entities, narratives, relaties, assertions, bronverwijzingen, lokale bestanden, IDs en slugs;
- de pipeline leidt inverse relaties, narrative mentions en backlinks af;
- gelokaliseerde slug-, zoek-, type- en geography-indexes worden opgebouwd;
- één deterministische runtimebundle wordt gegenereerd in `src/generated/content/knowledge-base.json`;
- `npm run content:new` genereert een leeg entitypackage zonder wijnfeiten toe te voegen.

Op 31 augustus 2026 valideert `npm run content:check`:

```text
5 entities
1 narrative
0 sources
4 forward relations
```

Alle vijf entities en de narrative zijn prototypes met status `draft`. Deze getallen beschrijven de huidige repository, niet de beoogde uiteindelijke dekking.

## Samenhang met bindend beleid

Dit document definieert eigendom, structuur, relaties, indexing en migratie van kennis. Aanvullende bindende regels staan in:

- `product-principles.md` voor productrollen, lokalisatie, kwaliteit en interfaceprincipes;
- `geography-policy.md` voor plaatsen, coördinaten, geometrie en Atlas;
- `visual-language.md` voor UI, responsive gedrag, kaarten, media en toegankelijkheid;
- `../editorial/research-policy.md` voor onderzoek, provenance, claims, vertaling, correcties en redactionele migratie.

De concrete authoringworkflow staat in `content-authoring.md`. Bij verschil tussen een voorbeeld in dit document en het strikte schema is `../src/content/model.ts` het uitvoerbare v1-contract; dit document moet daarna worden gecorrigeerd.

---

## 1. Eén kennisstelsel, meerdere productvormen

Oenocademy behandelt wijnkennis als een verbonden systeem:

```text
entities + relations + assertions + sources + geography
                         ↓
       Explore / Learn / Atlas / search / compare
                         ↓
                  localized presentation
```

Explore, Learn en Atlas zijn complementaire views op hetzelfde stelsel:

- **Explore** ondersteunt vrij ontdekken en doorklikken;
- **Learn** ordent gedeelde kennis didactisch;
- **Atlas** is de geografische expressie van dezelfde knowledge graph.

Learn is geen aparte contentdatabase en domineert Explore of Atlas niet. Een learning path rangschikt entities en narratives; het kopieert hun canonical feiten niet.

### Eén feit, meerdere views

Een stabiel feit krijgt één canonical eigenaar. Dat een producent in een appellation ligt, hoort bijvoorbeeld in een entityrelatie. Een narrative mag uitleggen waarom die ligging relevant is, maar wordt niet de enige of tweede bron van dezelfde structurele relatie.

### Data en narratief verschillen

- **Data** legt vast wat iets is, hoe het verbonden is, wanneer een claim geldt en waarop die claim steunt.
- **Narratief** legt betekenis, context, samenhang, nuance en didactische volgorde uit.

### Relaties zijn first-class

Relaties voeden afgeleide backlinks, gerelateerde onderwerpen, navigatie en zoekindexen. Publieke interfaces vertalen relaties naar menselijk leesbare taal; raw IDs en relation enums zijn geen eindgebruikerscopy.

---

## 2. Vaste architectuurprincipes

1. **Entity-first, narrative-second.** Stabiele onderwerpkennis hoort bij entities; narratives verbinden en verklaren.
2. **Eén shared graph voor NL en EN.** Feiten, IDs, relaties, assertions, bronnen en geografie worden niet per taal gedupliceerd.
3. **Nederlands is de primaire redactietaal.** Engels is een bewust onderhouden lokalisatie, geen onafhankelijke feitenlaag of ongecontroleerde fallback.
4. **Provenance gaat voor volledigheid.** Een schema-geldige claim is niet automatisch een geverifieerde claim.
5. **Geografie komt uit geverifieerde data.** Grenzen, coördinaten en containment worden nooit gegokt of generatief verzonnen.
6. **Concepten mogen educatief worden geïllustreerd.** Illustratie mag vereenvoudigen, maar geen documentaire, wetenschappelijke of geografische bewijsrol veinzen.
7. **Kennisdiepte staat los van routes en opleidingen.** Het interne depth-model is niet hetzelfde als WSET of een andere externe indeling.
8. **Migratie is niet-destructief.** Legacy-input blijft herstelbaar totdat een gecontroleerde vervanger bestaat.
9. **Geen filler of verzonnen feiten.** Onbekend, afwezig of expliciet draft is beter dan schijnbare volledigheid.
10. **Het model groeit vanuit aangetoonde use-cases.** Nieuwe typen en velden worden niet toegevoegd om hypothetische volledigheid na te streven.

---

## 3. Contentlagen

### Geïmplementeerd in v1

#### Entities

Zelfstandig adresseerbare kennisobjecten met een stabiele ID, gedeelde metadata en NL/EN-presentatie.

#### Relations en assertions

Gestructureerde verbindingen tussen entities en brongebonden scalaire claims.

#### Narratives

Gelokaliseerde redactionele documenten die entities expliciet kunnen noemen en daardoor backlinks genereren.

#### Sources

Herbruikbare bronrecords onder `data/sources/`. Het schema en de validatie zijn geïmplementeerd; de repository bevat momenteel nog geen echt bronrecord.

#### Geography references

Een entity kan een gevalideerde `geography_id` dragen en de bundle bouwt daar een index voor. Het beheer en importeren van echte geometrie is nog roadmap.

### Roadmap

- een volwaardige, geverifieerde geography-datalaag;
- een platformbreed mediaregister met stabiele asset-IDs;
- learning-pathpackages die gedeelde kennis rangschikken;
- section-/blockmetadata voor fijnmazige depth en provenance;
- rijkere search, compare en bronweergave boven op de gegenereerde graph.

---

## 4. Entitymodel

### Geïmplementeerde v1-typen

Het strikte schema accepteert precies deze entitytypen:

```text
region
appellation
site
producer
grape
classification
vintage
concept
```

#### `region`

Een geografisch of cultureel wijngebied dat als kennisobject relevant is. Een region is niet automatisch een wettelijke appellation.

#### `appellation`

Een wettelijk beschermde geografische herkomstbenaming of vergelijkbaar formeel systeem. Juridische status en geografische vorm moeten volgens het research- en geographybeleid worden onderbouwd.

#### `site`

Een betekenisvolle kleinere wijnbouwsite, bijvoorbeeld een climat, lieu-dit of individuele wijngaard. Land- of stelselspecifieke verschillen horen in metadata of relaties, niet automatisch in een nieuw entitytype.

#### `producer`

Een château, domaine, Weingut, estate, coöperatie of andere producerende organisatie. Een producer kan meerdere relevante plaatsen en appellations hebben; een adres is niet automatisch een wijnbouwlocatie.

#### `grape`

Een druivenras of cultivar. Lokale namen en synoniemen zijn presentatie- en zoekvraagstukken, niet automatisch afzonderlijke cultivars.

#### `classification`

Een classificatiesysteem met relaties die zo nodig temporele geldigheid en tiermetadata dragen.

#### `vintage`

Een jaargang binnen een expliciete scope. Een Bordeaux-jaargang zegt niet automatisch iets over heel Frankrijk, iedere appellation of iedere producent.

#### `concept`

Een inhoudelijk begrip dat niet primair geografisch of organisatorisch is, bijvoorbeeld véraison, botrytis of carbonic maceration.

Het huidige strikte schema heeft **geen** `domain`-veld voor concepts. Een gecontroleerde domeinindeling, bijvoorbeeld `viticulture` of `winemaking`, is een mogelijke latere schema-extensie en geen geaccepteerde v1-syntax.

### Uitgesteld kandidaat-type

`wine_style` is niet geïmplementeerd. Het blijft hoogstens een kandidaat voor later, wanneer meerdere browse- of compare-use-cases aantonen dat een stijl een zelfstandig entitytype nodig heeft. Tot die beslissing mag `wine_style` niet in canonical metadata worden gebruikt.

### Geen entity voor ieder zelfstandig naamwoord

Maak pas een entity wanneer gebruikers het onderwerp zelfstandig moeten kunnen vinden, meerdere pagina's ernaar moeten verwijzen, of er voldoende eigen kennis en relaties voor bestaan.

---

## 5. Identiteit, slugs en lokalisatie

### Stable IDs

Een entity-ID volgt:

```text
<entity-type>.<canonical-slug>
```

Bijvoorbeeld:

```text
region.bordeaux
appellation.pauillac
producer.chateau-latour
grape.cabernet-sauvignon
classification.bordeaux-1855
```

Een ID verandert niet door vertaling of een kleine naamswijziging.

### Slugs zijn presentatie; IDs zijn identiteit

NL- en EN-routes mogen verschillende slugs hebben en toch naar dezelfde entity wijzen. De pipeline valideert slugbotsingen per entity- of narrativetype en locale en genereert een `localized_slugs`-index.

### Gedeeld en gelokaliseerd

Gedeeld:

- IDs, typen en status;
- relaties en assertions;
- bron- en geographyreferenties;
- numerieke en temporele metadata.

Gelokaliseerd:

- namen, titels en slugs;
- entity-overviews en narrativeartikelen;
- toekomstige captions, alt-teksten, aliases en UI-copy.

Beide localebestanden zijn in v1 verplicht. Ontbrekende vertalingen worden niet stilzwijgend gegenereerd of vervangen door de andere taal.

---

## 6. Geïmplementeerd entitypackage

Canonical entities staan in:

```text
content/entities/<entity-type-directory>/<slug>/
├── entity.yaml
├── overview.nl.md
├── overview.en.md
└── media/              # alleen package-specifiek en optioneel
```

Een schema-geldig voorbeeld:

```yaml
id: producer.example-estate
type: producer
status: draft
canonical_name: Example Estate
names:
  nl: Example Estate
  en: Example Estate
slugs:
  nl: example-estate
  en: example-estate
locales:
  nl: overview.nl.md
  en: overview.en.md
relations:
  - type: located_in
    target: appellation.example
assertions:
  - id: assertion.example-estate.founded
    predicate: founded
    value: 1900
    status: verified
    sources:
      - source.example-register
    last_verified: 2026-08-31
source_refs:
  - source.example-register
geography_id: geo.example-estate-winery
depth: intermediate
framework_alignment:
  - framework: WSET
    level: 3
    relation: extension
last_reviewed: 2026-08-31
```

`geography_id`, `depth`, `framework_alignment` en `last_reviewed` zijn optioneel. Het schema is strict: niet-gedefinieerde velden, waaronder een oud genest `content:`-object, worden afgewezen. `locales` bevat alleen package-relative bestandsnamen; paden buiten het package worden afgewezen.

De voorbeeldwaarden hierboven demonstreren uitsluitend de vorm. Ze zijn geen publiceerbare wijnfeiten en mogen niet zonder onderzoek als content worden overgenomen.

---

## 7. Relatiemodel

### Geïmplementeerde relation vocabulary

V1 valideert deze typen:

```text
part_of
contains
located_in
produces_in
associated_with
important_grape
parent_appellation
classified_under
related_to
contrasts_with
scope
```

De vocabulary is bewust klein en mag via een expliciete schemawijziging evolueren. Een nieuw enum wordt niet ad hoc in content geïntroduceerd.

### Forward eenmaal schrijven, inverse afleiden

Auteurs leggen de canonical forward relation eenmaal vast:

```yaml
relations:
  - type: located_in
    target: appellation.pauillac
```

De pipeline valideert de target-ID, weigert exacte duplicaten en leidt de inverse lookup af. Een targetentity hoeft dus niet handmatig dezelfde verbinding terug te schrijven.

### Metadata en tijd

Relaties ondersteunen scalaire `properties` en top-level `valid_from` en `valid_to`:

```yaml
relations:
  - type: classified_under
    target: classification.bordeaux-1855
    properties:
      tier: premier-cru
    valid_from: 1855
```

`tier` is eigenschappenmetadata; `valid_from` staat op relatieniveau. Hierdoor kan historie worden behouden zonder de huidige toestand over het verleden te projecteren.

---

## 8. Assertions en provenance

Assertions zijn geschikt voor tijdgevoelige, numerieke, betwistbare of andere claims die expliciete ondersteuning nodig hebben. Het v1-schema accepteert een string, getal of boolean als `value`, geen `{type, value}`-object:

```yaml
assertions:
  - id: assertion.example-estate.organic-since
    predicate: organic_since
    value: 2018
    status: verified
    sources:
      - source.example-certifier
    valid_from: 2018
    last_verified: 2026-08-31
```

Geïmplementeerde assertionstatussen:

```text
verified
provisional
contested
historical
deprecated
```

`sources` bevat minimaal één bekende `source.*`-ID. De pipeline valideert bronreferenties en dubbele assertion-IDs. Het huidige prototype heeft nog geen sources en daarom ook geen brongebonden assertions.

### Sourceregister

Herbruikbare YAML-records onder `data/sources/` volgen het geïmplementeerde schema:

```yaml
id: source.example-register
source_type: regulator
publisher: Example authority
title: Example official register
url: https://example.org/register
published_at: 2026-01-15
accessed_at: 2026-08-31
language: en
status: active
```

Ondersteunde source types zijn `regulator`, `academic`, `book`, `trade-body`, `producer`, `critic`, `journalism`, `historical-document` en `dataset`. Bronkeuze, claim-level support, citaten en correcties volgen `../editorial/research-policy.md`; er bestaat geen universele automatische waarheidsscore per source type.

---

## 9. Narratives en entitylinks

Narratives verbinden entities en claims tot menselijke uitleg. V1 ondersteunt:

```text
lesson
regional-deep-dive
producer-profile
comparison
tasting-guide
historical-essay
explainer
```

Een schema-geldig package bevat:

```text
content/narratives/<type-directory>/<slug>/
├── narrative.yaml
├── article.nl.md
├── article.en.md
└── media/              # alleen package-specifiek en optioneel
```

Voorbeeldmetadata:

```yaml
id: narrative.regional.bordeaux-proof
type: regional-deep-dive
status: draft
title:
  nl: Bordeaux pipeline-proef
  en: Bordeaux pipeline proof
slugs:
  nl: bordeaux-pipeline-proef
  en: bordeaux-pipeline-proof
locales:
  nl: article.nl.md
  en: article.en.md
primary_entity: region.bordeaux
related_entities:
  - appellation.pauillac
source_refs: []
depth: foundation
```

`primary_entity`, `depth` en `framework_alignment` zijn optioneel; `related_entities` en `source_refs` worden als arrays gevalideerd.

### Inline entitylinks zijn geïmplementeerd

Markdown gebruikt definitief deze vormen:

```md
[[producer.example-estate]]
[[producer.example-estate|Example Estate]]
```

De eerste vorm laat de renderer later een gelokaliseerd label kiezen; de tweede legt het zichtbare label vast. De parser valideert syntax en entity-ID, bouwt locale-aware mentions en genereert narrativebacklinks. Routes worden niet in Markdown hardgecodeerd.

### Learning paths

Een learning path is conceptueel een geordende view op bestaande narratives en entities:

```text
curriculum != canonical content storage
curriculum = curated path through shared content
```

Een formeel learning-pathschema en pipeline-integratie zijn nog roadmap.

---

## 10. Kennisdiepte en opleidingsalignment

### Geïmplementeerd metadata-contract

Entities en narratives kunnen één optionele `depth` dragen:

```text
foundation
intermediate
advanced
specialist
```

Ook `framework_alignment` is op entity- en narrativeniveau geïmplementeerd:

```yaml
framework_alignment:
  - framework: WSET
    level: 3
    relation: extension
```

Ondersteunde relaties zijn `prerequisite`, `core-overlap`, `extension` en `beyond`. Een extern opleidingskader is metadata en bepaalt de ontologie niet.

### Besloten conventie, implementatie pending: depth per block

Een lang document kan blocks met verschillende diepte hebben. De authoringsyntax
voor stabiele block-IDs, blocktypen, `depth`, `source_refs`, entitylinks en
citations is vastgelegd in `content-blocks.md`. Parser, validator, gegenereerde
blockmetadata en rendering zijn nog niet geïmplementeerd. Block-level
`framework_alignment` blijft bewust uitgesteld.

---

## 11. Contentpipeline

### Canonical input

De pipeline leest:

- `content/entities/**/entity.yaml` plus hun package-relative NL/EN-Markdown;
- `content/narratives/**/narrative.yaml` plus hun package-relative NL/EN-Markdown;
- herbruikbare YAML-bronrecords onder `data/sources/`.

Canonical content staat niet in `src/generated/content/`.

### Validatie

`npm run content:check` valideert zonder output te schrijven onder meer:

- strikte schema's, enums, IDs en ID/type-overeenkomst;
- dubbele entity-, narrative-, assertion- en geography-IDs;
- gelokaliseerde slugs en routebotsingen;
- vereiste package-relative localebestanden;
- bekende entity- en sourceverwijzingen;
- dubbele relaties en bronverwijzingen;
- inline entitylinksyntax, mentions en targets.

Validatie is noodzakelijk maar bewijst geen feitelijke juistheid.

### Afgeleide graph en bundle

`npm run content:build` voert dezelfde validatie uit en schrijft precies één deterministische runtimebundle:

```text
src/generated/content/knowledge-base.json
```

Die bundle bevat:

- genormaliseerde entities, narratives en sources;
- forward relations en afgeleide inverse relations;
- locale-aware narrative mentions en entitybacklinks;
- entity-ID- en entity-type-indexes;
- gelokaliseerde sluglookups;
- een entitymetadata-searchindex;
- geography-ID-lookups.

De generator verwijdert oude gesplitste JSON-outputs. De gegenereerde directory is genegeerd door Git, kan vóór een build afwezig zijn en mag nooit handmatig worden aangepast.

### Packagegenerator

```bash
npm run content:new -- producer example-estate
```

maakt een schema-geldig draftpackage met metadata, NL/EN-Markdown en een lokale `media/`-directory. De generator voegt bewust geen feiten, bronnen, relaties of vertalingen met inhoud toe.

---

## 12. Repositorystructuur voor v1

```text
project/
├── content/
│   ├── entities/
│   │   └── <entity-type-directory>/<slug>/
│   │       ├── entity.yaml
│   │       ├── overview.nl.md
│   │       ├── overview.en.md
│   │       └── media/
│   └── narratives/
│       └── <type-directory>/<slug>/
│           ├── narrative.yaml
│           ├── article.nl.md
│           ├── article.en.md
│           └── media/
├── data/
│   ├── sources/
│   └── geography/                  # roadmap zodra verified data is gekozen
├── docs/
│   ├── content-authoring.md
│   ├── geography-policy.md
│   ├── knowledge-architecture.md
│   ├── product-principles.md
│   └── visual-language.md
├── editorial/
│   └── research-policy.md
├── scripts/content/
│   ├── cli.ts
│   ├── generator.ts
│   └── pipeline.ts
├── src/content/model.ts            # strict uitvoerbaar v1-schema
└── src/generated/content/
    └── knowledge-base.json         # afgeleid, deterministisch, niet canonical
```

Eventuele lege legacy-directoryremnants zijn geen onderdeel van het canonical v1-contract. Legacy-materiaal is uitsluitend migratie-input en wordt niet door de huidige canonical pipeline gelezen.

YAML-metadata plus gelokaliseerde Markdownpackages en file-backed canonical content met build-time indexing zijn voor v1 besloten en geïmplementeerd. Een latere database of PostGIS-runtime kan nuttig worden bij schaal, querying of geografie, maar is geen open keuze die huidige authoring of canonical ownership blokkeert. Zo'n verandering vereist een expliciet, niet-destructief migratieontwerp.

---

## 13. Geografie

Geografie is first-class kennis, maar de volledige geographydatalaag is nog niet geïmplementeerd. V1 heeft alleen:

- een optioneel gevalideerd `geography_id` op entities;
- uniquenessvalidatie voor geography-IDs;
- een geography lookup in de gegenereerde bundle.

Er staan nog geen geverifieerde Bordeauxgrenzen, producentcoördinaten of andere Atlasgeometrieën in het huidige prototype.

Wanneer geography wordt toegevoegd, gelden `geography-policy.md` en `../editorial/research-policy.md`. De kernregel blijft:

> Geography is rendered from verified data. Concepts may be illustrated.

Een kaartafbeelding, screenshot, generatieve vorm of geocoded postadres wordt niet de bron van een grens of wijngaardlocatie. Source, licentie, CRS, transformaties, versie, semantiek en onzekerheid moeten behouden blijven.

---

## 14. Media

Package-specifieke `media/`-directories worden door de packagestructuur ondersteund. Een platformbreed mediaschema, stable media IDs, reviewstatussen en automatische media-indexing zijn nog niet geïmplementeerd.

Roadmapmedia kunnen onder meer conceptillustraties, wetenschappelijke diagrammen, data-driven kaarten, hybrid maps, charts, foto's en historische beelden omvatten. Hun nauwkeurigheid, rechten, credits, lokalisatie en toegankelijkheid volgen `visual-language.md` en het researchbeleid.

Nieuwe herbruikbare visuals bevatten bij voorkeur geen permanent ingebakken taalafhankelijke labels. Factual maps en charts komen uit geverifieerde data; een beeldmodel verzint geen grenzen, coördinaten, assen of waarden.

---

## 15. Search, routing en discovery

### Geïmplementeerd

De bundle bevat:

- alle entity-IDs;
- entities gegroepeerd per type;
- NL- en EN-sluglookups per entitytype;
- een zoekindex met ID, type, canonical name, localized names en slugs;
- geographylookups waar `geography_id` bestaat;
- forward/inverse relations en narrativebacklinks voor discovery.

Dit is indexing-infrastructuur. Welke routes en zoekinterfaces de applicatie publiek aanbiedt, blijft een applicatiebeslissing boven op deze graph.

### Roadmap

- full-text zoeken in narrativepassages;
- aliases en historische namen zodra het schema die ondersteunt;
- ranking van exacte entities, related entities en passages;
- facetten zoals geography, depth, classification, grape en contenttype;
- compare views en rijke relationele discovery.

---

## 16. Correcties en migratie

Gebruikers wijzigen canonical data niet rechtstreeks. Een toekomstige correction flow kan change proposals gebruiken, maar het reviewproces is nog niet als applicatiefunctie geïmplementeerd.

Voor iedere migratie gelden deze stappen:

1. inventariseer legacyfeiten, narratief, assets en bronverwijzingen;
2. wijs stabiele feiten toe aan entities en assertions;
3. schrijf relaties eenmaal als canonical forward relation;
4. registreer en verifieer bronnen volgens het researchbeleid;
5. migreer uitleg naar NL/EN-narratives zonder feiten te dupliceren;
6. valideer packages en afgeleide graph;
7. controleer inhoud, provenance, lokalisatie en media vóór legacyverwijdering.

Een schema-geldige migratie is nog niet automatisch inhoudelijk geverifieerd. Legacy-input blijft herstelbaar totdat de vervanger volledig gecontroleerd is.

---

## 17. Bordeaux: huidige proof en roadmap

### Huidige repositorystatus

De Bordeaux proof bevat vijf draftentities:

| Entity | Huidige rol |
| --- | --- |
| `region.bordeaux` | regionale root van de proof |
| `appellation.pauillac` | onderdeel van Bordeaux; koppelt Cabernet Sauvignon |
| `producer.chateau-latour` | ligt in Pauillac; tijdsbewuste classificatierelatie |
| `grape.cabernet-sauvignon` | druifentity voor relationele proof |
| `classification.bordeaux-1855` | target van `classified_under` |

Daarnaast bestaat één draft `regional-deep-dive`:

```text
narrative.regional.bordeaux-proof
```

De vier forward relations bewijzen `part_of`, `important_grape`, `located_in` en `classified_under`. De classificatierelatie bevat `tier: premier-cru` en top-level `valid_from: 1855`.

Dit is een pipeline- en modelproof, geen inhoudelijk complete of publiceerbare Bordeauxvertical slice. Er is nog geen `vintage.bordeaux-2016`, geen echt `source.*`-record, geen brongebonden assertion en geen geverifieerde geografie.

### Pending voor een echte vertical slice

- research en migratie van rijke canonical entitycontent;
- de geplande scoped vintage-entity;
- minimaal één echt herbruikbaar bronrecord en claim-level ondersteuning;
- inhoudelijk volwaardige NL- en EN-narratives;
- geverifieerde boundaries, punten en Atlasdata met volledige provenance;
- vervanging of review van legacy media;
- section-/block-level depth en provenance;
- publieke bronweergave en menselijk leesbare relaties;
- Explore-, Learn- en Atlaspresentaties uit dezelfde canonical graph;
- end-to-end routing, search, related content en accessibility review.

De architectuur wordt vóór grootschalige regiomigratie aangepast als deze slice alleen met grote uitzonderingen kan worden gebouwd.

---

## 18. V1-contract versus roadmap

### Besloten en geïmplementeerd

- self-contained YAML + localized Markdownpackages;
- file-backed canonical content;
- acht entitytypen en de gevalideerde relation vocabulary;
- entity-, narrative-, relation-, assertion- en sourceschema's;
- NL/EN als verplichte gelokaliseerde presentatielagen;
- stable entitylinks met mentions en backlinks;
- entity/narrative depth en framework alignment;
- inverse relations, localized slug/search/geography-indexes;
- één deterministische gegenereerde runtimebundle;
- een entitypackagegenerator en validation/buildcommands.

### Besloten principe, implementatie pending

- verified-data-only geography en Atlas;
- reusable provenance en claim-level support in echte content;
- learning paths als curated views in plaats van contentopslag;
- media met controleerbare accuracy, rights en localization;
- niet-destructieve migratie van legacycontent.

### Open roadmapontwerp

- implementatie van de besloten Markdown-directives, blockvalidator en renderer;
- learning-pathschema en voortgangsmodel;
- geography storage, import en mogelijke PostGIS-runtime;
- mediaschema en platformbrede assetcatalogus;
- aliasmodel, full-text search, ranking en facetten;
- provenance- en uncertaintypresentatie in de UI;
- correctie- en community suggestionworkflow;
- de fijnmazigheid en UI van externe framework alignment;
- criteria voor een mogelijk toekomstig `wine_style`-type.

Open roadmapkeuzes veranderen het huidige v1-authoringcontract niet stilzwijgend. Iedere schema- of canonical-storagewijziging vereist documentatie, validatie, migratie en behoud van bestaande provenance.

---

## 19. Definition of done voor architectuuruitbreidingen

Een uitbreiding is pas onderdeel van het actieve contract wanneer:

- het schema en de canonical authoringvorm expliciet zijn;
- validatie en relevante afleidingen zijn geïmplementeerd en getest;
- NL/EN-eigendom en routinggedrag duidelijk zijn;
- provenance, onzekerheid en migratie-effecten zijn beoordeeld;
- geography en media aan hun bindende beleid voldoen;
- generated output reproduceerbaar en niet handmatig authored blijft;
- documentatie current state en roadmap opnieuw correct scheidt.

Tot die tijd blijft de uitbreiding roadmap, ook als er al een ontwerpvoorbeeld of lege directory voor bestaat.
