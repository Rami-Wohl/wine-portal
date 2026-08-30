---
title: "Knowledge architecture"
purpose: "Canonical content-, data-, provenance- en migratiearchitectuur voor het wijnkennisportaal"
status: "draft-for-review"
version: "0.1"
created: "2026-08-25"
last_updated: "2026-08-25"
---

# Knowledge architecture

> **Status:** eerste architectuurvoorstel, geschreven vóór de daadwerkelijke migratie van Bordeaux. Dit document beschrijft de beoogde *source of truth* voor content en data. De huidige module-/lesstructuur blijft intact als legacy-bron totdat onderdelen gecontroleerd zijn gemigreerd.

## 1. Van curriculum naar kennisplatform

Het project begon als een modulair curriculum voor verdieping na WSET 3. Dat blijft een belangrijk gebruiksdoel, maar is niet langer de beste primaire structuur voor alle kennis die het project verzamelt.

De nieuwe architectuur behandelt het project als een **verbonden kennisplatform over wijn**. Dezelfde onderliggende kennis moet meerdere interfaces kunnen voeden:

- **Learn** — didactische leerroutes en lessen;
- **Explore** — vrij doorklikken tussen onderwerpen;
- **Atlas** — geografische exploratie van regio's, appellaties, sites en producenten;
- **Search** — full-text en entity-aware zoeken;
- **Compare** — regio's, druiven, producenten, jaargangen of concepten naast elkaar;
- **Reference** — snel feiten, definities, classificaties en broninformatie opzoeken.

De fundamentele verschuiving is daarom:

```text
oude primaire structuur
module → les → tekst → afbeeldingen

nieuwe primaire structuur
entities + relations + assertions + sources + geography
                         ↓
          narratives / lessons / maps / search / compare
```

Een les blijft waardevol, maar is voortaan een **narrative view** op gedeelde kennis en niet de enige plek waar die kennis bestaat.

---

# 2. Architectuurprincipes

## 2.1 Eén feit, meerdere views

Feiten die op meerdere plaatsen nodig zijn worden niet onafhankelijk in verschillende artikelen onderhouden.

Voorbeeld:

> Château Latour is een producent in Pauillac en behoort tot de Premiers Crus van de classificatie van 1855.

De structurele relaties horen bij de Latour-, Pauillac- en classificatiedata. De Bordeaux-verdieping mag deze feiten narratief gebruiken, maar is niet de enige bron ervan.

## 2.2 Narratief en data zijn verschillende dingen

**Data** beschrijft wat iets *is* en hoe het met andere dingen verbonden is.

**Narratief** legt uit waarom die informatie ertoe doet, welke nuance nodig is en hoe een lezer erover kan denken.

Een producentrecord kan bijvoorbeeld bevatten dat Latour in Pauillac ligt en Premier Cru is. Een artikel kan uitleggen waarom Latour stilistisch en historisch belangrijk is.

## 2.3 Relaties zijn first-class

De waarde van het platform zit niet alleen in losse pagina's, maar in verbindingen:

```text
Bordeaux
  ├── Pauillac
  │    ├── Château Latour
  │    ├── Cabernet Sauvignon
  │    └── Classification 1855
  ├── Pomerol
  └── Vintage 2016
```

De interface moet zulke verbindingen kunnen gebruiken voor breadcrumbs, related topics, search, filters, vergelijking en kaartnavigatie.

## 2.4 Geografie wordt uit data gerenderd; concepten worden geïllustreerd

> **Geography is rendered from data. Concepts are illustrated.**

Dit is een harde publicatieregel.

Geografische grenzen, rivieren, producentlocaties en wijngaarden mogen niet door een generatief beeldmodel worden verzonnen wanneer zij als naslagwerk worden gepresenteerd.

## 2.5 Bronnen en tijdigheid zijn onderdeel van de data

Bij veranderlijke of betwistbare informatie is niet alleen de waarde belangrijk, maar ook:

- waar die vandaan komt;
- wanneer zij is gecontroleerd;
- voor welke periode zij geldig is;
- hoe zeker of voorlopig zij is.

## 2.6 Kennisdiepte is onafhankelijk van navigatie

Een gebruiker mag dezelfde Bordeaux-pagina kunnen bekijken met verschillende informatiedieptes. We maken daarom geen aparte "WSET 3 Bordeaux" en "expert Bordeaux" als twee los onderhouden kenniswerelden.

## 2.7 Meertaligheid wordt vanaf het datamodel ondersteund

Nederlands en Engels zijn twee presentatielagen op dezelfde entiteiten, relaties, bronnen en geometrieën. Feitelijke data wordt niet dubbel bijgehouden per taal.

## 2.8 Migratie is niet destructief

Legacy-bestanden worden pas verwijderd wanneer hun vervanger inhoudelijk gecontroleerd is. Tot die tijd blijft de huidige curriculumstructuur een herstelbare bron.

---

# 3. De vijf contentlagen

De nieuwe kennisbank bestaat conceptueel uit vijf lagen.

## Laag A — Entities

Dingen waarnaar zelfstandig kan worden verwezen.

Voorbeelden:

- Bordeaux;
- Pauillac;
- Château Latour;
- Cabernet Sauvignon;
- classificatie van 1855;
- Bordeaux 2016;
- botrytis;
- véraison.

## Laag B — Relations en assertions

Gestructureerde verbindingen en controleerbare claims.

Voorbeelden:

- Château Latour → `located_in` → Pauillac;
- Pauillac → `part_of` → Bordeaux;
- Château Latour → `classified_as` → Premier Cru 1855;
- Cabernet Sauvignon → `important_in` → Pauillac.

## Laag C — Geography

Exacte of expliciet afgeleide geometrieën:

- regio-/appellationpolygonen;
- rivieren;
- sites en wijngaarden;
- producentpunten;
- optioneel hoogte/topografie.

## Laag D — Narratives

Menselijk geschreven uitleg:

- lessen;
- regionale deep dives;
- producer profiles;
- vergelijkingen;
- tasting guides;
- historische essays.

## Laag E — Media

- conceptuele illustraties;
- data-driven kaarten;
- hybride kaarten;
- diagrammen;
- grafieken;
- eventueel foto's waarvoor gebruiksrecht beschikbaar is.

---

# 4. Entitymodel

## 4.1 Kernentitytypes voor v1

We beginnen bewust met een beperkt aantal typen. Nieuwe typen worden pas toegevoegd wanneer meerdere concrete use-cases aantonen dat een generiek bestaand type niet voldoet.

### `region`

Een geografisch/cultureel wijngebied dat als kennisobject relevant is.

Voorbeelden:

- Bordeaux;
- Bourgogne;
- Mosel;
- Napa Valley.

Een region is niet automatisch hetzelfde als een wettelijke appellation.

### `appellation`

Een wettelijk beschermde geografische herkomstbenaming of equivalent systeem.

Voorbeelden:

- Pauillac AOC;
- Saint-Émilion AOC;
- Bordeaux AOC.

Dit onderscheid voorkomt problemen wanneer een naam zowel een brede regio als een formele appellation aanduidt.

### `site`

Een geografisch kleinere wijnbouwsite die betekenisvol genoeg is voor een eigen pagina.

Voorbeelden kunnen zijn:

- climat;
- lieu-dit;
- cru-site;
- individuele wijngaard;
- MGA;
- Grosses Gewächs-site.

`site` gebruikt een subtype in plaats van voor ieder land een nieuw entitytype te introduceren.

### `producer`

Producent, château, domaine, Weingut, estate, coöperatie of andere producerende organisatie.

Een producer kan meerdere locaties, appellations en wijnen hebben.

### `grape`

Druivenras of relevante cultivar-entiteit.

Synoniemen en lokale namen worden als alias vastgelegd en niet als onafhankelijke druif, tenzij het werkelijk verschillende cultivars zijn.

### `classification`

Classificatiesysteem inclusief temporele geldigheid en tiers.

Voorbeelden:

- Bordeaux 1855;
- Saint-Émilion 2022;
- Crus Bourgeois 2025.

### `vintage`

Jaargangbeoordeling binnen een expliciete scope.

Voorbeeld:

- `vintage.bordeaux.2016` is iets anders dan `vintage.sauternes.2016` of een producent-specifieke jaargangnotitie.

Een vintage-entiteit zegt dus nooit impliciet iets over "heel Frankrijk".

### `concept`

Een inhoudelijk begrip dat niet primair geografisch of organisatorisch is.

Voorbeelden:

- véraison;
- botrytis cinerea;
- vine water status;
- carbonic maceration;
- limestone;
- source–sink-relations.

`concept` krijgt een `domain`, bijvoorbeeld `viticulture`, `geology`, `winemaking`, `chemistry`, `sensory` of `economics`.

### `wine_style`

Een herkenbare stijl die nuttig is voor vergelijkende navigatie en leren.

Voorbeelden:

- dry botrytised-free Sémillon/Sauvignon Bordeaux blend;
- Sauternes-style botrytised sweet wine;
- traditional-method sparkling wine.

Dit type wordt alleen gebruikt wanneer stijlen daadwerkelijk als zelfstandig browse-/compare-object nodig zijn.

## 4.2 Geen entity voor ieder zelfstandig naamwoord

De knowledge graph is geen excuus om alles te atomiseren.

Een keldervat, snoeischaar of individuele technische term hoeft geen entity te zijn tenzij:

1. gebruikers er zelfstandig naar zullen zoeken;
2. meerdere pagina's ernaar moeten linken;
3. er voldoende inhoud voor een zelfstandige pagina bestaat.

---

# 5. IDs, slugs en namen

## 5.1 Stable ID

Een entity krijgt één stabiele technische ID.

Voorkeursvorm:

```text
<type>.<canonical-slug>
```

Voorbeelden:

```text
region.bordeaux
appellation.pauillac
producer.chateau-latour
grape.cabernet-sauvignon
classification.bordeaux-1855
vintage.bordeaux-2016
concept.vine-water-status
```

De ID wordt niet aangepast vanwege een vertaling of kleine naamswijziging.

## 5.2 Slugs zijn presentatie, IDs zijn identiteit

Routes mogen later veranderen zonder entityreferenties te breken.

Bijvoorbeeld:

```text
/nl/regios/bordeaux/pauillac
/en/regions/bordeaux/pauillac
```

kan in beide gevallen verwijzen naar:

```text
appellation.pauillac
```

## 5.3 Aliases

Per taal kunnen zoek- en historische namen worden vastgelegd.

Voorbeeld:

```yaml
aliases:
  nl:
    - cabernet sauvignon
  en:
    - cabernet sauvignon
  fr:
    - cabernet-sauvignon
```

Aliases zijn belangrijk voor search, oude namen en lokale spellingen.

---

# 6. Basisrecord van een entity

Een portable serialisatie kan YAML of JSON zijn. De exacte runtime-implementatie wordt bewust niet door dit document aan Next.js, Prisma of een specifieke database gekoppeld.

Conceptueel minimum:

```yaml
id: producer.chateau-latour
type: producer
canonical_name: Château Latour
status: active

names:
  nl: Château Latour
  en: Château Latour

relations:
  - type: located_in
    target: appellation.pauillac

assertions: []

content:
  nl: content/entities/producers/chateau-latour.nl.md
  en: content/entities/producers/chateau-latour.en.md

last_reviewed: 2026-08-25
```

Niet elk veld hoeft direct gevuld te zijn. Onbekend is beter dan gegokt.

---

# 7. Relatiemodel

## 7.1 Veelvoorkomende relaties

Voor v1 voorzien we ten minste:

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
```

Een deel hiervan kan in de applicatie bidirectioneel worden afgeleid. Als `producer.chateau-latour located_in appellation.pauillac`, hoeft Pauillac niet noodzakelijk handmatig een lijst met alle producenten bij te houden.

## 7.2 Relaties mogen metadata hebben

Bijvoorbeeld classificatiemembership:

```yaml
- type: classified_under
  target: classification.bordeaux-1855
  properties:
    tier: premier-cru
    valid_from: 1855
```

Of een producent die meerdere appellations gebruikt:

```yaml
- type: produces_in
  target: appellation.pessac-leognan
  properties:
    role: primary
```

## 7.3 Tijdsafhankelijke relaties

Eigendom, classificaties, appellationregels en namen veranderen.

Relaties ondersteunen daarom waar relevant:

```yaml
valid_from: 2022
valid_to: null
```

Historie wordt niet overschreven alsof de huidige toestand altijd heeft bestaan.

---

# 8. Assertions en provenance

Niet ieder simpel identiteitsveld hoeft een uitgebreid claimobject te zijn. Maar **tijdelijke, numerieke, betwistbare, reputatiegerelateerde of potentieel veranderlijke informatie** moet bron- en tijdmetadata kunnen dragen.

## 8.1 Assertionmodel

Conceptueel:

```yaml
- id: assertion.chateau-latour.sales-policy-2012
  predicate: sales_policy
  value:
    type: text
    value: "Niet langer via de klassieke jaarlijkse en-primeurrelease"
  valid_from: 2012
  status: verified
  sources:
    - source.chateau-latour-official
  last_verified: 2026-08-25
```

## 8.2 Assertionstatus

```text
verified      voldoende ondersteund
provisional   waarschijnlijk maar nog te vroeg voor definitief oordeel
contested     relevante bronnen spreken elkaar tegen
historical    historisch waar, niet meer huidige situatie
deprecated    claim bleek onjuist of is vervangen
```

## 8.3 Bronhiërarchie is contextafhankelijk

Geen simpele algemene rangorde is in iedere situatie correct.

Voor wet- en appellationgegevens heeft een officiële regulator meestal prioriteit. Voor een producents eigen hectare- of kelderinformatie is een officiële technische fiche vaak de primaire bron. Voor kwalitatieve reputatie of jaarganginterpretatie is juist triangulatie van meerdere onafhankelijke kritische bronnen nodig.

Daarom krijgt een source een `source_type`, maar geen universele automatische waarheidsscore.

---

# 9. Sourceregister

Bronnen worden herbruikbaar geregistreerd zodat URL, titel en publisher niet in tientallen bestanden onafhankelijk hoeven te worden onderhouden.

Conceptueel:

```yaml
id: source.inao-saint-emilion-2022
source_type: regulator
publisher: INAO
title: "Classement des crus de Saint-Émilion 2022"
url: "..."
published_at: 2022-09-08
accessed_at: 2026-08-25
language: fr
status: active
```

Mogelijke `source_type`-waarden:

```text
regulator
academic
book
trade-body
producer
critic
journalism
historical-document
dataset
```

## 9.1 Geen stilzwijgende bronvervanging

Wanneer een oude bron niet meer bereikbaar is, wordt zij niet zonder notitie vervangen door een andere bron die toevallig dezelfde claim ondersteunt. De provenancegeschiedenis moet controleerbaar blijven.

---

# 10. Kennisdiepte en opleidingsalignment

## 10.1 Eigen depth-model

Het platform gebruikt een onafhankelijk intern dieptemodel:

```text
foundation    noodzakelijke basis voor het onderwerp
intermediate  directe verdieping; gevorderde wijnstudent
advanced      meerdere systemen/nuances combineren
specialist    niche, academisch, producent- of site-specifiek
```

De gebruiker kan bijvoorbeeld kiezen:

```text
Depth: Intermediate
Depth: Advanced
Depth: No limits
```

## 10.2 Externe opleidingskaders zijn metadata

WSET kan als behulpzaam referentiekader worden gebruikt, maar bepaalt niet de interne ontologie.

Conceptueel:

```yaml
framework_alignment:
  - framework: WSET
    level: 3
    relation: extension
```

Mogelijke `relation`-waarden:

```text
prerequisite
core-overlap
extension
beyond
```

Dit maakt later ook andere leerframeworks mogelijk zonder de contentstructuur te veranderen.

## 10.3 Depth hoort uiteindelijk bij contentblokken

Een hele Bordeauxpagina is niet eenvoudig één niveau.

De introductie kan `foundation` zijn, de uitleg over bodem × waterstatus `advanced` en de producent-specifieke vintageanalyse `specialist`.

De contentpipeline moet daarom metadata op **sectie-/blokniveau** kunnen ondersteunen.

De exacte Markdown/MDX-syntax wordt pas bij de website-implementatie gekozen. De architectuur vereist alleen dat ieder zelfstandig contentblok minimaal kan dragen:

```text
block_id
depth
entity_mentions
source_refs
optional framework_alignment
```

---

# 11. Meertaligheid

## 11.1 Eén knowledge graph, meerdere talen

Niet:

```text
NL-database
EN-database
```

maar:

```text
shared entities / relations / assertions / sources / geography
                 ↓
           localized content
```

## 11.2 Wat gedeeld wordt

Taalonafhankelijk:

- IDs;
- relaties;
- coördinaten;
- geometrieën;
- classificatiemembership;
- numerieke feiten;
- data-provenance;
- bronregister.

## 11.3 Wat gelokaliseerd wordt

- titels waar vertaling wenselijk is;
- summaries;
- lange artikelen;
- labels en UI-copy;
- captions;
- alt-teksten;
- zoekaliases.

## 11.4 Illustraties met ingebakken tekst

De huidige Nederlandstalige infographic-PNG's leren ons een belangrijke regel:

> **Nieuwe herbruikbare visuals bevatten bij voorkeur geen taalafhankelijke labels die permanent in het rasterbeeld zijn gebakken.**

Voorkeursvolgorde:

1. labelvrije basisillustratie + HTML/SVG-overlay;
2. volledig vector-/HTML-diagram met lokaliseerbare labels;
3. aparte, expliciet gelokaliseerde rastervarianten wanneer 1 en 2 onpraktisch zijn.

Een Nederlandse PNG mag als legacy-lesasset blijven bestaan, maar is niet automatisch een geschikte platformasset voor Engels.

---

# 12. Narratives en learning paths

## 12.1 Narratives

Narratives zijn redactionele documenten die entities en claims tot een begrijpelijk verhaal verbinden.

Typen kunnen zijn:

```text
lesson
regional-deep-dive
producer-profile
comparison
tasting-guide
historical-essay
explainer
```

Een narrative krijgt bijvoorbeeld:

```yaml
id: narrative.regional.bordeaux-deep-dive
type: regional-deep-dive
primary_entity: region.bordeaux
locales:
  nl: content/narratives/bordeaux.nl.md
  en: content/narratives/bordeaux.en.md
```

## 12.2 Learning paths

Een curriculum/module is een geordende verzameling narratives en eventueel specifieke entity-pages.

Dus:

```text
curriculum != content storage
curriculum = curated path through content
```

Dat maakt het mogelijk dezelfde Bordeaux-deep-dive zowel los via Explore als als onderdeel van een gevorderd leerpad aan te bieden.

## 12.3 Inline entitylinks

Narratives moeten expliciet naar entities kunnen linken zonder routes hard te coderen.

Conceptueel voorbeeld:

```text
[[Château Latour|producer.chateau-latour]]
```

De uiteindelijke parser mag hiervan later een route, preview-card of tooltip maken.

De gekozen serialization-syntax staat nog open; de **stable entity ID** is het belangrijke architectuurpunt.

---

# 13. Geography

## 13.1 Geografie is first-class data

Een kaart-PNG is nooit de bron van geografische waarheid.

Geografische entities verwijzen naar geometrie-objecten of datasets.

Conceptueel:

```yaml
geography:
  geometry_ref: geometry.appellation.pauillac
  geometry_status: official-informative
  source: source.inao-pauillac-geodata
  last_verified: 2026-08-25
```

## 13.2 Geometrietype

Ondersteun minimaal:

```text
Point
LineString
Polygon
MultiPolygon
```

Daarmee kunnen producenten, rivieren, appellaties en complexe gebieden worden weergegeven.

## 13.3 Betekenis van producer-coördinaten

Een producerpunt moet een expliciete semantiek hebben:

```text
winery             fysieke kelder / bezoeklocatie
estate-centroid    representatief punt van landgoed
vineyard-centroid  representatief punt van wijngaarden
mailing-address    administratieve locatie; niet automatisch kaartlocatie
```

We plotten nooit een geocoded postadres alsof dat vanzelf de wijngaardlocatie is.

## 13.4 Geometry provenance

Iedere geometry heeft waar mogelijk:

- bron/dataset;
- licentie;
- publicatie-/updatedatum;
- datum van import;
- toepasselijke disclaimer;
- transformatiestappen;
- precisie/status.

Mogelijke status:

```text
authoritative        juridisch/formeel leidend
official-informative officiële dataset maar niet juridisch leidend
derived              afgeleid uit betrouwbare data
community-reviewed   extern/community, handmatig gecontroleerd
schematic             alleen voor uitleg, nooit exacte naslagkaart
```

## 13.5 Schematische geografie

Een mentale kaart mag bestaan, maar alleen wanneer zij visueel niet wordt verward met exacte cartografie en expliciet als `schematic` is gemarkeerd.

Voor de Atlas-interface worden `schematic` geometrieën nooit als appellationgrens gebruikt.

## 13.6 Rendering is los van geometrie

Kleuren, labels, hoverstates en simplification zijn presentatielaag. De brongeometrie blijft behouden.

Hierdoor kan dezelfde Pauillac-polygon gebruikt worden voor:

- wereldkaart;
- Bordeauxdetailkaart;
- appellationpagina;
- compare view;
- mobiele kaart.

---

# 14. Media-architectuur

## 14.1 Mediatypen

```text
concept-illustration
scientific-diagram
data-map
hybrid-map
chart
photo
historical-image
```

## 14.2 Accuracy contract

### `concept-illustration`

Mag vereenvoudigen, maar moet inhoudelijk expliciet gecontroleerd zijn.

Geschikt voor:

- wijnstokfysiologie;
- bodem-waterconcepten;
- vinificatie;
- source–sink;
- botrytis.

### `data-map`

Alle geometrie komt uit gecontroleerde geografische data.

Geen generatief model bepaalt grenzen of coördinaten.

### `hybrid-map`

De kaartbasis is data-driven; illustratieve elementen mogen daaromheen of bovenop worden toegevoegd zolang zij de geografie niet wijzigen.

### `chart`

Grafiekwaarden komen uit gestructureerde, bronvermelde data. Een afbeeldingmodel verzint geen assen of waarden.

## 14.3 Assetmetadata

Een platformasset moet conceptueel minimaal kunnen dragen:

```yaml
id: media.bordeaux.soil-water
media_type: concept-illustration
status: reviewed
localization: layered
accuracy: conceptual-reviewed
sources:
  - source.example
alt:
  nl: "..."
  en: "..."
```

## 14.4 Publicatiestatus media

```text
draft
review-needed
approved
deprecated
replace-before-publication
```

---

# 15. Search en discovery

Search wordt entity-aware en niet alleen full-text.

Een entity levert minimaal:

- canonical name;
- localized names;
- aliases;
- type;
- parent geography;
- korte summary;
- relevante relations.

Zo kan zoeken naar `Latour` direct onderscheid maken tussen:

- Château Latour;
- eventueel andere producenten/sites met Latour in de naam;
- passages waarin Latour wordt genoemd.

## 15.1 Searchresultaten

Voorkeur voor drie lagen:

1. **exact entities**;
2. **related entities**;
3. **narrative passages**.

## 15.2 Facetten

Later mogelijk:

- type;
- land/regio;
- depth;
- taal;
- classification;
- grape;
- vintage;
- contenttype.

---

# 16. Corrections en community suggestions

Gebruikers wijzigen canonical data niet direct.

Een suggestie is een **change proposal**.

Conceptueel:

```yaml
proposal_type: correction
target_entity: producer.example
target_assertion: assertion.example.owner
current_value: "..."
proposed_value: "..."
source_url: "..."
rationale: "..."
status: submitted
```

Workflow:

```text
submitted → triaged → accepted/rejected → verified → merged
```

Voor v1 kan de technische implementatie eventueel via GitHub Issues/PR's lopen. De knowledge architecture hoeft daar niet van afhankelijk te zijn.

---

# 17. Voorgestelde repositorystructuur na migratie

De uiteindelijke exacte namen kunnen bij implementatie nog veranderen, maar deze scheiding is het doelmodel:

```text
project/
├── README.md
├── knowledge-architecture.md
├── curriculum.md                  # curated Learn-structuur
│
├── data/
│   ├── entities/
│   │   ├── regions/
│   │   ├── appellations/
│   │   ├── sites/
│   │   ├── producers/
│   │   ├── grapes/
│   │   ├── classifications/
│   │   ├── vintages/
│   │   └── concepts/
│   ├── sources/
│   └── geography/
│
├── content/
│   ├── narratives/
│   │   ├── nl/
│   │   └── en/
│   └── entities/
│       ├── nl/
│       └── en/
│
├── media/
│   ├── illustrations/
│   ├── diagrams/
│   └── generated-map-exports/     # outputs; nooit geometry source of truth
│
├── learning/
│   └── paths/
│
├── editorial/
│   ├── research-policy.md
│   ├── writing-style.md
│   ├── visual-style.md
│   └── migration-status.md
│
└── legacy/
    └── modules/                    # tijdelijk totdat migratie gecontroleerd is
```

### Waarom media niet meer standaard naast een les staat

In het oude curriculum was dat logisch omdat een illustratie vrijwel altijd één les diende.

In het nieuwe platform kunnen dezelfde media voorkomen op:

- een entitypagina;
- een deep dive;
- een learning path;
- search/preview;
- een compare view.

Herbruikbare media horen daarom een eigen stabiele asset-ID te krijgen.

**Uitzondering:** volledig narrative-specifieke assets mogen naast het narrative blijven als hergebruik zeer onwaarschijnlijk is.

---

# 18. Migratiestatussen

Bestaande content/assets krijgen één van deze migratiestatussen.

## `retain`

Inhoud en vorm passen in de nieuwe architectuur. Alleen registreren/verplaatsen/metadata toevoegen.

## `migrate`

Inhoud is bruikbaar, maar moet worden opgesplitst, gelokaliseerd, van provenance voorzien of naar nieuwe datastructuren worden vertaald.

## `redesign`

Het concept blijft, de huidige presentatie is niet geschikt voor het platform.

## `replace`

De asset/data mag niet als canonical publicatiebron worden gebruikt. Een nieuwe bron/asset is noodzakelijk.

## `deprecated`

Alleen voor historische/hersteldoeleinden bewaren; niet in publieke output.

---

# 19. Bordeaux als architectuurtest

Bordeaux bevat vrijwel alle moeilijke gevallen en is daarom de eerste vertical slice.

## 19.1 Testentities

De architectuur moet minimaal elegant kunnen modelleren:

```text
region.bordeaux
appellation.pauillac
producer.chateau-latour
grape.cabernet-sauvignon
classification.bordeaux-1855
vintage.bordeaux-2016
```

### Relatievoorbeeld

```text
region.bordeaux
  └── contains → appellation.pauillac

appellation.pauillac
  ├── part_of → region.bordeaux
  ├── important_grape → grape.cabernet-sauvignon
  └── contains/associated producer → producer.chateau-latour

producer.chateau-latour
  ├── located_in → appellation.pauillac
  └── classified_under → classification.bordeaux-1855 [tier: premier-cru]

vintage.bordeaux-2016
  └── scope → region.bordeaux
```

Dit is voldoende om bijvoorbeeld automatisch te tonen:

- Latour op de Pauillacpagina;
- Pauillac in Bordeaux;
- de classificatie op Latour;
- Bordeaux 2016 als relevante vintage;
- alle expliciete narrative-mentions van Latour.

---

# 20. Triage van de bestaande Bordeaux-assets

De vier huidige PNG's worden **niet verwijderd tijdens architectuurfase**. Zij blijven legacy-bronnen totdat vervangers zijn goedgekeurd.

## `06-01-bordeaux-river-system.png`

**Migratiestatus: `replace` → daarna `deprecated`.**

Reden:

- de afbeelding gebruikt kaartachtige geometrie;
- ook al staat er "schematisch, niet op schaal", de vormen en locaties kunnen gemakkelijk als geografische referentie worden geïnterpreteerd;
- de toekomstige Atlas heeft exacte, bronvermelde geografie nodig;
- Nederlandse labels zijn in het raster ingebakken.

Vervanger:

- data-driven Bordeaux-basemap;
- echte rivierlijnen en appellation-/regiogeometrie;
- labels uit de UI/localizationlaag;
- dezelfde visuele stijl kan in de renderer worden benaderd.

## `06-02-bordeaux-soil-water.png`

**Migratiestatus: `redesign`, concept behouden.**

Sterk punt:

- het beeld legt een fysiologisch concept uit en pretendeert geen exacte kaart te zijn.

Waarom toch redesign:

- labels zijn Nederlands ingebakken;
- "Médoc/Graves = grind", "Pomerol = klei" en "Saint-Émilion = kalksteen" zijn didactische archetypen, geen volledige lokale bodemkaarten;
- in het platform moet dat visueel explicieter als model worden gepresenteerd.

Vervanger:

- labelvrije bodemillustraties of SVG/vectorcomponent;
- tekst/callouts in HTML/SVG;
- expliciete caption: archetypische profielen, niet uniforme bodems van hele appellations.

## `06-03-left-bank-right-bank.png`

**Migratiestatus: `redesign`, concept behouden.**

Sterk punt:

- geen pseudo-cartografie;
- goede waarschuwing dat gemiddelden geen natuurwetten zijn.

Waarom redesign:

- taal zit in het raster;
- sommige stijltermen zijn interpretatief en moeten makkelijker te wijzigen/citeren zijn;
- als interactieve component kan de gebruiker later bijvoorbeeld druif, bodem, rijping en uitzonderingen afzonderlijk tonen.

Vervanger:

- responsive compare-component of SVG;
- labels en claims als lokaliseerbare data/content;
- illustratieve wijnstok/bodemlaag kan behouden worden.

## `06-04-bordeaux-classifications.png`

**Migratiestatus: `replace-as-component`; huidige PNG blijft tijdelijke NL-referentie.**

De informatie is momenteel bruikbaar, maar classificaties zijn **gestructureerde, veranderlijke data**. Een statische PNG is daarom een slechte canonical representatie.

Vervanger:

- data-driven classification component;
- aantallen/tiernamen uit classification-entities/assertions;
- automatisch Nederlands/Engels;
- bron en geldigheidsdatum direct zichtbaar;
- optioneel exporteerbare infographic als afgeleide output.

### Algemene conclusie Bordeaux-media

Geen van de vier concepten gaat verloren. We vervangen vooral de manier waarop feiten, labels en geografie aan het beeld zijn gekoppeld.

---

# 21. Gevolg voor de illustraties uit les 1.1

De fysiologische illustraties zijn **inhoudelijk juist het soort beeld dat we willen behouden**: conceptueel, didactisch en niet afhankelijk van exacte cartografie.

Maar ook zij hebben Nederlandse tekst ingebakken.

Daarom:

```text
inhoudelijke status: retain
platform/i18n-status: migrate
```

Voor de eerste Nederlandse versie mogen de bestaande PNG's blijven. Voor een tweetalig platform kiezen we later per figuur tussen:

- een Engelse variant;
- labelvrije base art + gelokaliseerde overlays;
- herbouw als SVG/HTML-diagram.

We hoeven deze migratie niet vóór de Bordeaux vertical slice af te ronden.

---

# 22. Bordeaux-migratievolgorde

Na goedkeuring van deze architectuur:

## Fase 1 — structuur valideren

1. zes prototype-entities modelleren;
2. één sourcerecord;
3. één tijdsafhankelijke classificatierelatie;
4. één vintage-record;
5. controleren of de modellen niet Bordeaux-specifiek zijn.

## Fase 2 — Bordeaux-data extraheren

1. regio en appellations;
2. classificaties;
3. producenten;
4. druivenrelaties;
5. vintage-overzicht;
6. relevante conceptlinks;
7. iedere veranderlijke claim koppelen aan provenance.

## Fase 3 — geography

1. geschikte authoritative/official-informative datasets selecteren;
2. licentie en disclaimers registreren;
3. geometrieën normaliseren;
4. eerste exacte Bordeauxkaart renderen;
5. producerpunten alleen toevoegen als hun betekenis en bron duidelijk zijn.

## Fase 4 — narrative migreren

1. `06-01-bordeaux.md` als legacy-bron behouden;
2. facts die nu data zijn niet onnodig dupliceren;
3. narrative in gelokaliseerde contentblokken opdelen;
4. entitylinks toevoegen;
5. depthmetadata per blok toekennen;
6. bronnen behouden waar het narratief interpretatie bevat.

## Fase 5 — media

1. river-system vervangen;
2. soil-water redesignen;
3. Left/Right Bank redesignen;
4. classifications vervangen door data-component;
5. legacy-PNG's pas daarna deprecated markeren.

## Fase 6 — tweede use-case

Pas wanneer Bordeaux werkt, migreren we les 1.1 om te testen of de architectuur ook niet-regionale, fysiologische kennis goed ondersteunt.

---

# 23. Definition of done voor de Bordeaux vertical slice

Bordeaux is architectonisch geslaagd wanneer een toekomstige frontend uit dezelfde contentset minimaal kan maken:

- een Bordeaux-overviewpagina;
- een Pauillac-appellationpagina;
- een Château Latour-pagina;
- een Cabernet Sauvignon-pagina met Bordeauxrelaties;
- een 1855-classificationpagina;
- een Bordeaux 2016-vintagepagina;
- een exacte interactieve kaart;
- de lange Bordeaux-deep-dive;
- depth filtering;
- NL/EN content zonder duplicatie van kernfeiten;
- bronweergave per relevante claim;
- related-content-links zonder handmatige routehardcoding.

Wanneer daarvoor grote uitzonderingen nodig blijken, passen we de architectuur aan vóór verdere regio's worden geschreven.

---

# 24. Open beslissingen

Deze punten zijn bewust nog niet definitief omdat zij beter tijdens de eerste migratie kunnen worden getest.

### Serialisatie

- YAML versus JSON voor entitydata;
- Markdown versus MDX/directives voor blockmetadata.

### Runtime storage

- bestanden als canonical source met build-time indexing;
- of later database/PostGIS als canonical runtime-store.

De contentarchitectuur moet beide routes toelaten.

### Relationship vocabulary

De initiële relation types worden tijdens Bordeaux getest en daarna aangescherpt. Geen ontologie van honderden predicates vooraf ontwerpen.

### Media localization

Per type bepalen wanneer SVG/HTML-overlay beter is dan aparte localized rastervariants.

### Geography detail

Niet ieder land heeft even toegankelijke officiële appellationgeometrie. Per jurisdictie moet provenancebeleid worden toegepast zonder inferieure data stilzwijgend als exact te presenteren.

### WSET alignment

Exact bepalen hoe fijnmazig de mapping wordt en hoe in de UI duidelijk wordt gemaakt dat dit een onafhankelijke redactionele inschatting is.

---

# 25. Besluiten die met versie 0.1 wél vaststaan

1. **Entities en relaties worden de primaire kennisstructuur.**
2. **Lessen/narratives blijven bestaan als curated views.**
3. **Geografie wordt niet generatief verzonnen wanneer nauwkeurigheid wordt gesuggereerd.**
4. **Sources, validiteit en last-verified metadata zijn first-class voor veranderlijke claims.**
5. **Internal depth staat los van externe opleidingsframeworks.**
6. **Nederlands en Engels delen dezelfde feitelijke data.**
7. **Tekst in rasterillustraties wordt voor nieuwe platformassets zo veel mogelijk vermeden.**
8. **Bordeaux wordt de eerste vertical slice.**
9. **Migratie is niet destructief: legacy blijft totdat de vervanger is gecontroleerd.**
10. **We ontwerpen niet eerst de hele wijnwereld; we bewijzen het model volledig met Bordeaux.**

