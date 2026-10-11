# Overkoepelende productplanning

Bijgewerkt: 2026-10-11. Deze kaart bepaalt volgorde en timing; actuele
status en acceptatiecriteria staan uitsluitend in de gekoppelde domeinbacklogs.
De [codebase-review](../editorial/codebase-health-review-2026-10-11.md) en
[performancereview](../editorial/performance-review-2026-10-11.md) motiveren
de huidige volgorde. Eerdere uitvoeringsresultaten staan in het
[reviewregister](quality-assurance.md#reviewregister), niet opnieuw in dit plan.

## Waar we staan

De entity-first basis werkt: gedeelde YAML, gelijkwaardige NL/EN-Markdown,
strict gevalideerde graph, server-only repository en gedeelde presentatie.
Explore, zoeken, verdiepingen en één Learn-pilot gebruiken deze basis.
Browservoortgang staat los van authored content. De conceptuele keten van
wijngaard tot waarneming is gepubliceerd; mondiale dekking vraagt nog een
expliciete dependency- en ownershipcontrole.

Atlas heeft geen geverifieerde dataset. Er is een Next.js-server, maar geen
accountdatabase, remote voortgang, redactiebackend of externe publieke API.
De contentrepository heeft synchrone lookups; de voortgangsadapter heeft een
async interface. Dat onderscheid telt bij toekomstige lazy loading of opslag.

## Eerstvolgende werk en beslismomenten

- **Tussengevoegd: feedbackfase 0.** De
  [feedbackroadmap](feedback-roadmap.md) bevat 34 open slices en 19 open
  beslisgates voor correcties/suggesties. Eerst `DEC-FBK-012/014` en `FBK-001`
  (flow/copy), daarnaast `DEC-FBK-011` vóór `FBK-003` (contentversies).
  `FBK-002/004/005` werken beleid, providerproef en privacy-/operationsgates uit.
  Dit plan is geen opdracht om al accounts of mail live te zetten.
- **Volgende inhoudelijke ontwikkeltaak: `EXP-032`.** Begin met identiteit, inventaris en de
  afgebakende Port/Sherry/Champagne-batch. De overige wijnbatches blijven open;
  geen `wine_style`-type op basis van alleen behoefte aan een pagina.
- **Daarna `EXP-026`.** Integreer de foundation en eerste wijnbatch; het volledige
  latere wijncataloguswerk blokkeert die integratie niet.
- **Schaalbasis getoetst (`MNT-052`).** 1×/3×/8× voldoen lokaal aan de budgetten
  na gerichte search-, repository- en mediavalidatieverbeteringen. Herhaal volgens
  [performance-budgets.md](performance-budgets.md) vóór grote regiobatches en bij
  relevante wijzigingen. Er is nu geen performancegedreven databasemigratie nodig.
- **Vóór regionale publicatie: `REG-001–003`.** Besluit landen-/plaatshiërarchie,
  druivenprioriteiten en mondiale dependencies. Voer de geverifieerde Atlaspilot
  (`MNT-051`), mondiale stresstest (`EXP-027`) en integrale QA (`EXP-028`) uit.
  De [regionale roadmap](region-expansion-roadmap.md) bevat publicatiegates en
  de definitie van gereed. Loire en Mendoza zijn voorlopige pilotkandidaten.
- **Tijdgebonden:** `MNT-055` hercontroleren uiterlijk 2026-10-18;
  `LRN-012` vroegst 2026-10-22 bij voldoende werkelijk gebruik. Kies het volgende
  leerpad vanuit die evaluatie. `MNT-050` is nu vervroegd naar feedbackfase 0:
  feedback is de eerste concrete backendconsumer; Learn-sync volgt pas na eigen
  pilot-/conflictbesluit. Geen performancegedreven migratie van wijncontent.
- **Externe vrijgave:** `MNT-056` zodra toegang beschikbaar is. Lokale tests
  bevestigen geen GitHub-run, branch protection of Vercel-runtime.

Dit is een aanbevolen afwisseling, geen algemene stop op content totdat ieder
onderhoudsticket klaar is. Grote schema-, opslag- en curriculumwijzigingen
vereisen hun eigen gemotiveerde besluit; planningswerk kan naast authoring lopen.

## Volledige uitvoeringsvoorraad op de peildatum

57 niet-afgeronde tickets: 13 onderhoudsacties, 4 Explore-tickets, 5 regionale
planning-/publicatietickets, één Learn-evaluatie en 34 feedbacktickets.
De 19 `DEC-FBK-*`-besluiten tellen als gates, niet als extra implementatietickets.
Geplande en geblokkeerde
acties tellen mee. Tijdgebonden of vrijgekomen externe controles mogen de
onderstaande ontwikkelvolgorde onderbreken.

Het feedbackspoor wordt per fase vrijgegeven; het vervangt de bestaande
content-/onderhoudsvolgorde niet door 34 onvoorwaardelijke vóórtaken:

| Volgorde binnen feedback | Werk en gate |
| --- | --- |
| Fase 0: `FBK-001–005` | Productflow/beleid, deterministische contentversies, providerproef en privacy-/operationele keuzes; `MNT-050` sluiten vóór databasebouw |
| Fase 1: `FBK-006–025` | Accounts, vijf meldsoorten, moderatie, mail, misbruik/beroep en rechten; stagingbouw na fase-0-gate, publieke lancering pas via `FBK-025` en `MNT-056` |
| Fase 2: `FBK-026–031` | Selectie, Mijn meldingen, versieverschil, correctielog, opt-in-credit en GitHubkoppeling |
| Fase 3: `FBK-032–034` | Vertrouwde bijdragers en Learn-sync; sync wacht ook op `LRN-012` en `DEC-FBK-019` |

Eerst deze tussenronde afbakenen, daarna het inhoudelijke spoor voortzetten;
de bouw-/lanceringsronde voor feedbackfase 1 wordt afzonderlijk ingepland.
Provider- en privacygates blijven expliciet open totdat besloten. Het bestaande
content-/onderhoudsspoor blijft:

| Volgorde | Ticket | Werk |
| ---: | --- | --- |
| 1 | `EXP-032` | Individuele wijnen: inventaris, Port/Sherry/Champagne als eerste batch; vervolg blijft open |
| 2 | `EXP-026` | Graph, links, media, terminologie en expliciete owners integreren |
| 3 | `MNT-060` | Resterende documentatieconsolidatie met behoud van contracten en historie |
| 4 | `REG-001` | Landen-/plaatshiërarchie en regionale geografiestrategie besluiten |
| 5 | `REG-002` | Druivenprioriteiten en proportioneel publicatiecontract toetsen |
| 6 | `REG-003` | Mondiale inhoudsgaten afbakenen en uitvoerbare contentbatches plannen |
| 7 | `MNT-051` | Geverifieerde Bordeaux-Atlaspilot afbakenen vóór EXP-027 |
| 8 | `EXP-027` | Mondiale claims toetsen, inclusief koel en warm/droog contrast; regiokeuze bevestigen |
| 9 | `EXP-028` | Integrale redactionele en product-QA |
| 10 | `MNT-061` | Getypeerde UI-berichtencatalogus vóór derde taal of forse nieuwe UI |
| 11 | `MNT-062` | Browsertestcontracten en risicogerichte contentsampling vóór grote regiobatches |
| 12 | `MNT-053` | Bestaande SVG-illustraties naar passende rasterstijl migreren |
| 13 | `REG-004` | Eerste regionale pilot publiceren, voorlopig Loire, na de publicatiegates |
| 14 | `REG-005` | Contrasterende tweede pilot, voorlopig Mendoza; daarna volgende regiobatches kiezen |

`REG-003` is een planningticket: de nog te schrijven content wordt vóór uitvoering
in afzonderlijke batches/tickets opgesplitst. De huidige telling claimt dus niet
dat alle toekomstige mondiale content al als afzonderlijk ticket bestaat.

Tijdgebonden:

| Moment | Ticket | Werk |
| --- | --- | --- |
| Vroegst 2026-10-22 bij voldoende werkelijk gebruik | `LRN-012` | Learn-pilot evalueren en vervolg kiezen, inclusief kandidaat-wijngaardleerpad |

Vervroegde platformgate: `MNT-050` bij feedbackfase 0, vóór `FBK-006`.
Het is al meegeteld bij de 13 onderhoudsacties en wordt niet dubbel als FBK-ticket geteld.

Geblokkeerd, in aanbevolen oppakvolgorde zodra de afhankelijkheid beschikbaar is:

| Prioriteit bij vrijgave | Ticket | Afhankelijkheid |
| ---: | --- | --- |
| 1 | `MNT-056` | Toegang tot GitHub/Vercel voor externe CI-/deploymentverificatie |
| 2 | `MNT-055` | Compatibele upstreampatch voor braces; handmatige hercontrole uiterlijk 2026-10-18 |
| 3 | `MNT-002` | Geverifieerde Atlasdata voor Bordeauxkaart |
| 4 | `MNT-014` | Officiële Barsac-/Sauternes-geometrie |
| 5 | `MNT-013` | Wereldwijde druivenverspreidingsdata |
| 6 | `MNT-020` | Producentenfoto's met aantoonbare hergebruikrechten |
| 7 | `MNT-039` | Definitief officieel EU-besluit Graves Supérieures |

Ticketstatus en acceptatiecriteria staan in de
[onderhoudsbacklog](maintenance-backlog.md),
[Explore-roadmap](explore-foundation-roadmap.md),
[Learn-roadmap](learn-roadmap.md) en
[regionale roadmap](region-expansion-roadmap.md), plus de
[feedbackroadmap](feedback-roadmap.md).
Draftentities vormen een voorraad, geen automatische publicatiebelofte.

## Wanneer backend of database nodig wordt

- **Accounts en synchronisatie:** gebruikersopslag met authenticatie,
  autorisatie en voortgangs-/conflictenbeheer, inclusief migratie van bestaande
  browservoortgang en behoud van path-/step-ID's.
- **Redactionele samenwerking:** rollen, review/publicatie, audittrail, export,
  backups en canonical ownership afspreken vóór een CMS of schrijf-API.
- **Externe consumers:** versieerbaar contract voor een echte afnemer; de
  serverrenderer hoeft zijn eigen data niet eerst via een eigen REST-API te lezen.
- **Search en geografie:** aanvullende querying op gemeten volume en vereiste
  queries. Afgeleide SQLite/FTS is iets anders dan migratie van authored content;
  een kleine geverifieerde Atlasdataset vereist niet automatisch PostGIS.

Bewust uitstel krijgt een toetsbare trigger. Feedback heeft nu een concrete
gefaseerde backlog; het backendbesluit daarvoor kan niet meer op een ontbrekende
consumer worden uitgesteld. Research, bronnen en canonical content blijven bij
iedere migratie behouden. Verdere framework alignment en vergelijkingsfuncties
blijven mogelijke vervolgrichtingen zonder huidige uitvoeringsbelofte.
