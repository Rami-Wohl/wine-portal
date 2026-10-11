# Overkoepelende productplanning

Bijgewerkt: 2026-10-11. Deze kaart bepaalt volgorde en timing; actuele
status en acceptatiecriteria staan uitsluitend in de gekoppelde domeinbacklogs.
De [codebase-review](../editorial/codebase-health-review-2026-10-11.md) motiveert
de huidige bijstelling. Eerdere uitvoeringsresultaten staan in het
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

- **Volgende ontwikkeltaak: `MNT-052`.** Meet 1×/3×/8×, stel budgetten vast en
  kies op bewijs welke search-/bundle-/mediaoptimalisatie nodig is. Compacte
  JSON en één corpusbuild per `check` zijn nu uitgevoerd (`MNT-059`); zij
  bewijzen geen kleinere serverchunk of lager processgeheugen.
- **Daarna `EXP-032` en `EXP-026`.** Publiceer de eerste afgebakende individuele
  wijnbatch en controleer vervolgens integratie, terminologie en owners.
  De overige wijnbatches blijven zichtbaar open; geen `wine_style`-type op
  basis van alleen behoefte aan een pagina.
- **Vóór regionale publicatie: `REG-001–003`.** Besluit landen-/plaatshiërarchie,
  druivenprioriteiten en mondiale dependencies. Voer de geverifieerde Atlaspilot
  (`MNT-051`), mondiale stresstest (`EXP-027`) en integrale QA (`EXP-028`) uit.
  De [regionale roadmap](region-expansion-roadmap.md) bevat publicatiegates en
  de definitie van gereed. Loire en Mendoza zijn voorlopige pilotkandidaten.
- **Tijdgebonden:** `MNT-055` hercontroleren uiterlijk 2026-10-18;
  `LRN-012` vroegst 2026-10-22 bij voldoende werkelijk gebruik. Kies het volgende
  leerpad vanuit die evaluatie. `MNT-050` volgt daarbij of eerder zodra een
  concrete API-/account-/redactieconsumer ontstaat.
- **Externe vrijgave:** `MNT-056` zodra toegang beschikbaar is. Lokale tests
  bevestigen geen GitHub-run, branch protection of Vercel-runtime.

Dit is een aanbevolen afwisseling, geen algemene stop op content totdat ieder
onderhoudsticket klaar is. Grote schema-, opslag- en curriculumwijzigingen
vereisen hun eigen gemotiveerde besluit; planningswerk kan naast authoring lopen.

## Volledige uitvoeringsvoorraad op de peildatum

24 niet-afgeronde tickets: 14 onderhoudsacties, 4 Explore-tickets, 5 regionale
planning-/publicatietickets en één Learn-evaluatie. Geplande en geblokkeerde
acties tellen mee. Tijdgebonden of vrijgekomen externe controles mogen de
onderstaande ontwikkelvolgorde onderbreken.

| Volgorde | Ticket | Werk |
| ---: | --- | --- |
| 1 | `MNT-052` | Reproduceerbare schaalmeting, budgetten en gerichte optimalisatiekeuze |
| 2 | `EXP-032` | Individuele wijnen: inventaris, Port/Sherry/Champagne als eerste batch; vervolg blijft open |
| 3 | `EXP-026` | Graph, links, media, terminologie en expliciete owners integreren |
| 4 | `MNT-060` | Resterende documentatieconsolidatie met behoud van contracten en historie |
| 5 | `REG-001` | Landen-/plaatshiërarchie en regionale geografiestrategie besluiten |
| 6 | `REG-002` | Druivenprioriteiten en proportioneel publicatiecontract toetsen |
| 7 | `REG-003` | Mondiale inhoudsgaten afbakenen en uitvoerbare contentbatches plannen |
| 8 | `MNT-051` | Geverifieerde Bordeaux-Atlaspilot afbakenen vóór EXP-027 |
| 9 | `EXP-027` | Mondiale claims toetsen, inclusief koel en warm/droog contrast; regiokeuze bevestigen |
| 10 | `EXP-028` | Integrale redactionele en product-QA |
| 11 | `MNT-061` | Getypeerde UI-berichtencatalogus vóór derde taal of forse nieuwe UI |
| 12 | `MNT-062` | Browsertestcontracten en risicogerichte contentsampling vóór grote regiobatches |
| 13 | `MNT-053` | Bestaande SVG-illustraties naar passende rasterstijl migreren |
| 14 | `REG-004` | Eerste regionale pilot publiceren, voorlopig Loire, na de publicatiegates |
| 15 | `REG-005` | Contrasterende tweede pilot, voorlopig Mendoza; daarna volgende regiobatches kiezen |

`REG-003` is een planningticket: de nog te schrijven content wordt vóór uitvoering
in afzonderlijke batches/tickets opgesplitst. De huidige telling claimt dus niet
dat alle toekomstige mondiale content al als afzonderlijk ticket bestaat.

Tijdgebonden:

| Moment | Ticket | Werk |
| --- | --- | --- |
| Vroegst 2026-10-22 bij voldoende werkelijk gebruik | `LRN-012` | Learn-pilot evalueren en vervolg kiezen, inclusief kandidaat-wijngaardleerpad |
| Aansluitend, of eerder bij concrete consumer | `MNT-050` | Backend/API/databasebesluit |

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
[regionale roadmap](region-expansion-roadmap.md).
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

Bewust uitstel krijgt een toetsbare trigger. Research, bronnen en canonical
content blijven bij iedere migratie behouden. Communitycorrecties, verdere
framework alignment en vergelijkingsfuncties blijven mogelijke vervolgrichtingen
zonder huidige uitvoeringsbelofte.
