# Producentenarchitectuur-review — 2026-09-09

Review-ID: `QCR-2026-09-09-01`

## Reikwijdte en methode

Deze review beoordeelt of het bestaande producentenmodel wereldwijd schaalbaar
is. Gecontroleerd zijn de entity-inventaris, de producer-authoringrichtlijn,
dependency-scaffolding, routes, Explore, zoeken, sitemap, statusrapportage en de
recente Pomeroldependencies. Er zijn geen inhoudelijke producentenclaims opnieuw
onderzocht.

## Samenvatting

Op de peildatum zijn 129 van de 228 entityrecords producenten: circa 57%. Tien
producenten zijn actief en 119 zijn draft. De bestaande schalen `iconisch`,
`kernproducent` en `referentieproducent` begrenzen de lengte, maar ieder genoemd
château kreeg nog steeds een zelfstandig package en impliciete paginabelofte.
Dat is redactioneel en visueel niet schaalbaar naar de rest van de wijnwereld.

De oplossing scheidt daarom identiteit van publicatievorm. Een producer-ID kan
voortaan een zelfstandige `monograph`, een `collection-profile` op een ownerpagina
of een compacte `register-entry` vertegenwoordigen. Stable IDs, relaties,
assertions en links blijven behouden; alleen de publieke bestemming en benodigde
prozaomvang verschillen.

## Bevindingen

1. De knowledge graph heeft terecht afzonderlijke producer-identiteiten nodig,
   maar een record hoeft geen zelfstandige publieke pagina te zijn.
2. Automatische dependency-scaffolding zonder publicatiebesluit maakte de
   toekomstige werkvoorraad kunstmatig groot.
3. Grote officiële cohorten, zoals classificaties, zijn didactisch sterker als
   gecontroleerde verzameling dan als tientallen losse mini-biografieën.
4. Informele producentenselecties moeten hun selectiegrond tonen en mogen geen
   zelfverzonnen kwaliteitsrang suggereren.
5. Bestaand afgerond producentenwerk hoeft niet destructief te worden verwijderd;
   consolidatie kan later per cohort en met behoud van routes en bronnen.

## Direct gecorrigeerd

`MNT-021` is uitgevoerd:

- het schema ondersteunt drie producentenpublicatievormen;
- schema-v2-contentplannen vereisen een expliciete keuze per producentdependency;
- collectie- en registerrecords vereisen een canonical ownerrelatie en, bij
  activatie, dezelfde gelokaliseerde owner-anchor;
- eigen overzichtsproza op embedded records wordt geweigerd om dubbele canonical
  tekst te voorkomen;
- actieve embedded links en oude routes wijzen naar de owner-anchor;
- Explore en sitemap tellen alleen zelfstandige monografieën, terwijl zoeken de
  actieve producerrecords kan blijven vinden;
- het statusrapport maakt recordaantal en publicatievorm apart zichtbaar;
- de authoring-, architectuur-, block- en toolingdocumentatie is bijgewerkt.

Als eerste planningspilot blijft `producer.petrus` een monografie. Acht overige
Pomerolrecords zijn als toekomstige collectieprofielen aan
`appellation.pomerol` gekoppeld. Zij blijven draft totdat hun beide gelokaliseerde
ownerblocks inhoudelijk zijn onderzocht, geschreven en gereviewd.

## Vervolgacties

- `MNT-022` — de resterende 110 legacy-draftproducenten per logisch cohort
  beoordelen en migreren zonder lege scaffolds blind te verwijderen.
- `MNT-023` — een eerste volledige Pomerol-producentenverzameling authoren en de
  active-link/redirectketen end-to-end bewijzen.
- `MNT-024` — de tien bestaande actieve producenten beoordelen op blijvende
  monografiewaarde en navigatiepositie; bestaand proza blijft behouden tot een
  aantoonbaar betere eigenaar bestaat.

## Addenda

Geen.
