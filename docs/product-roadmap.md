# Overkoepelende productplanning

Bijgewerkt: 2026-10-13. Deze kaart bepaalt volgorde en timing; actuele
status en acceptatiecriteria staan uitsluitend in de gekoppelde domeinbacklogs.
De [codebase-review](../editorial/codebase-health-review-2026-10-11.md) en
[performancereview](../editorial/performance-review-2026-10-11.md) motiveren
de huidige volgorde. Eerdere uitvoeringsresultaten staan in het
[reviewregister](quality-assurance.md#reviewregister), niet opnieuw in dit plan.

## Waar we staan

De entity-first basis werkt: gedeelde YAML, gelijkwaardige NL/EN-Markdown,
strict gevalideerde graph, server-only repository en gedeelde presentatie.
Explore, zoeken, vijftien actieve lessen en twee Learn-paden gebruiken deze basis.
Browservoortgang staat los van authored content. De conceptuele keten van
wijngaard tot waarneming is gepubliceerd; mondiale dekking vraagt nog een
expliciete dependency- en ownershipcontrole.

Atlas heeft geen geverifieerde dataset. Er is een Next.js-server, maar geen
accountdatabase, remote voortgang, redactiebackend of externe publieke API.
De contentrepository heeft synchrone lookups; de voortgangsadapter heeft een
async interface. Dat onderscheid telt bij toekomstige lazy loading of opslag.

## Eerstvolgende werk en beslismomenten

**Prioriteitsbesluit 2026-10-12:** de gebruiker heeft al een live URL, maar nog
geen gebruikers. Eerst meer inhoud, vooral lessen; Atlas waarschijnlijk ook
vóór bredere ingebruikname. Geen haast met feedback. Het openbare adres is geen
bewijs van gebruik en geen zelfstandige reden voor accounts of een database.

- **Het volledige wijngaardpad is actief.** Het goedgekeurde curriculum
  [Wijnstok en wijngaard](../editorial/briefs/learning-path.vine-and-vineyard.md)
  is via `LRN-014–017` geleverd: acht NL/EN-lessen, leercontext, terugblik,
  vervolgsuggesties en eigen lokale voortgang naast het stille-wijnpad.
  [Integrale publicatiereview](../editorial/vineyard-path-release-review-2026-10-13.md).
- **Eerstvolgend: `EXP-032`, daarna `EXP-026`.** Inventariseer individuele
  wijnen en hun juiste identiteit/owner; publiceer de eerste afgebakende
  Port/Sherry/Champagne-batch. Integreer daarna graph, links, media en
  terminologie. Latere wijncatalogusbatches blijven zichtbaar open; de eerste
  batch sluit EXP-032 niet zolang die voorraad resteert. Een regionale
  naam, beschermde herkomst en methode krijgen hun eigen passende scope.
- **Atlas expliciet voorbereiden: `MNT-051`.** Bronverkenning mag naast lessen
  lopen. Kies een kleine geverifieerde Bordeauxscope met provenance/licentie en
  afgebakende bouwtickets. Daarna kan `MNT-002` de eerste kaart leveren zodra
  data beschikbaar is; afbakening alleen betekent niet dat Atlas al bruikbaar is.
  Volledige Atlasscope en datum staan nog niet vast. Geen verzonnen geografie.
- **Feedback bewust geparkeerd, inclusief fase 0.** `FBK-001` blijft afgerond als
  [lokale ontwerpproef](feedback-flow.md). De overige 33 slices, hashes (`FBK-003`),
  provideronderzoek en de bijbehorende platformgate `MNT-050` zijn geen huidige
  vóórtaken. De [feedbackroadmap](feedback-roadmap.md#prioriteit-en-hervatpunt--besluit-2026-10-12)
  bewaart voortgang, besluiten, ontbrekend werk en hervatprocedure. Herbespreken
  bij review van een volgende les-/contentlevering of Atlaspilot; hervatten pas
  na expliciet prioriteitsbesluit, niet automatisch bij het halen van een mijlpaal.
- **Schaalbasis getoetst (`MNT-052`), harness aangescherpt (`MNT-063`).** Geen performancegedreven database nodig.
  Herhaal [performance-budgets.md](performance-budgets.md) vóór grote regiobatches
  en bij relevante corpus-/codewijzigingen. `MNT-065` breidt vóór grote batches
  de representativiteit van scenario's uit; `MNT-064` optimaliseert fixture-I/O
  alleen bij gemeten kosten. Beide blokkeren de huidige lessen niet.
- **Vóór regionale publicatie: `REG-001–003`, `EXP-027/028`.** Besluit plaatsmodel,
  druivenprioriteiten en mondiale dependencies; toets mondiale claims en publicatie.
  [Regionale gates](region-expansion-roadmap.md) blijven gelden; Loire/Mendoza zijn kandidaten.
- **Tijdgebonden/externe checks:** `MNT-055` hercontroleren uiterlijk 2026-10-18;
  `LRN-012` vroegst 2026-10-22 én alleen met genoeg werkelijk gebruik of gerichte
  gebruiksgesprekken. Geen gebruikers betekent evaluatie uitstellen, niet lessen
  uitstellen. `MNT-056` uitvoeren zodra toegang beschikbaar is; lokale tests zijn
  geen bewijs van GitHub-/Vercel-gedrag.

Dit is een aanbevolen afwisseling tussen lessen, naslag en Atlasvoorbereiding.
Curriculumgaps kunnen de volgorde van inhoudelijke batches gemotiveerd wijzigen.
Grote schema-, opslag- en curriculumwijzigingen houden hun eigen besluitpoort.

## Volledige uitvoeringsvoorraad op de peildatum

58 niet-afgeronde tickets: 15 onderhoudsacties, 4 Explore-tickets, 5 regionale
planning-/publicatietickets, 1 Learn-ticket (gebruiksevaluatie)
en 33 feedbacktickets. Die 33 feedbacktickets en MNT-050 zijn bewust geparkeerd;
ze blijven meetellen als resterend werk, niet als huidige uitvoeringsopdracht.
De 19 `DEC-FBK-*`-besluiten tellen als gates, niet als extra implementatietickets.
Geplande en geblokkeerde
acties tellen mee. Tijdgebonden of vrijgekomen externe controles mogen de
onderstaande ontwikkelvolgorde onderbreken.

Het feedbackspoor is geparkeerd. Onderstaande fasevolgorde geldt uitsluitend
**na expliciete hervatting**, niet vóór nieuwe content of Atlas:

| Volgorde bij feedbackhervatting | Werk en gate |
| --- | --- |
| Fase 0: `FBK-002–005` | Eerst FBK-003/DEC-FBK-011; daarna beleid, providerproef en privacy-/operationele keuzes; `MNT-050` sluiten vóór databasebouw |
| Fase 1: `FBK-006–025` | Accounts, meldingen, moderatie, mail, misbruik/beroep en rechten; staging na fase 0, publieke lancering pas via `FBK-025` en `MNT-056` |
| Fase 2: `FBK-026–031` | Selectie, Mijn meldingen, versieverschil, correctielog, opt-in-credit en GitHubkoppeling |
| Fase 3: `FBK-032–034` | Vertrouwde bijdragers en Learn-sync; sync wacht ook op `LRN-012` en `DEC-FBK-019` |

De aanbevolen inhoudelijke/voorbereidende volgorde is hieronder weergegeven.
Het curriculumakkoord, de drie lesbatches en pathpublicatie zijn afgerond.
Nu volgt de eerste EXP-032-batch, daarna de integratie in EXP-026.
Atlasbronverkenning kan naast dit contentwerk lopen.

| Volgorde | Ticket | Werk |
| ---: | --- | --- |
| 1 | `EXP-032` | Individuele wijnen: inventaris en eerste Port/Sherry/Champagne-batch; onafhankelijk van de lesbatches oppakbaar |
| 2 | `EXP-026` | Graph, links, media, terminologie en expliciete owners integreren |
| 3 | `MNT-051` | Kleine geverifieerde Bordeaux-Atlaspilot en bouwscope afbakenen; bronverkenning kan naast lessen lopen |
| 4 | `MNT-060` | Resterende documentatieconsolidatie met behoud van contracten en historie |
| 5 | `REG-001` | Landen-/plaatshiërarchie en regionale geografiestrategie besluiten |
| 6 | `REG-002` | Druivenprioriteiten en proportioneel publicatiecontract toetsen |
| 7 | `REG-003` | Mondiale inhoudsgaten afbakenen en uitvoerbare contentbatches plannen |
| 8 | `EXP-027` | Mondiale claims toetsen, inclusief koel en warm/droog contrast; regiokeuze bevestigen |
| 9 | `EXP-028` | Integrale redactionele en product-QA |
| 10 | `MNT-065` | Representatieve benchmarkscenario's en workloadversies vóór grote corpus-/Atlasuitbreiding |
| 11 | `MNT-061` | Getypeerde UI-berichtencatalogus vóór derde taal of forse nieuwe UI |
| 12 | `MNT-062` | Browsertestcontracten en risicogerichte contentsampling vóór grote regiobatches |
| 13 | `MNT-053` | Bestaande SVG-illustraties naar passende rasterstijl migreren |
| 14 | `REG-004` | Eerste regionale pilot publiceren, voorlopig Loire, na publicatiegates |
| 15 | `REG-005` | Contrasterende tweede pilot, voorlopig Mendoza; daarna volgende regiobatches kiezen |
| 16 | `MNT-064` | Fixture-I/O alleen optimaliseren bij gemeten setupkosten; geen voorganger van andere leveringen |

LRN-013–017 zijn afgerond; alle acht wijngaardlessen en het volledige path
zijn actief. De oorspronkelijke zevenlessenroute behoudt haar eigen voortgang.
De benchmarkreview voegde twee uitgestelde acties toe (`MNT-064/065`); de directe
correcties zijn afgerond in `MNT-063`. REG-003 blijft
een planningticket: toekomstige mondiale content krijgt vóór uitvoering eigen
batches/tickets. De huidige telling is geen volledige mondiale authoringlijst.

Tijdgebonden:

| Moment | Ticket | Werk |
| --- | --- | --- |
| Vroegst 2026-10-22 bij voldoende werkelijk gebruik | `LRN-012` | Learn-pilot en product-/architectuurvervolg toetsen; bij onvoldoende gebruik verlengen, geen gate voor meer lessen |

Geparkeerde platformgate: `MNT-050`, heropenen bij expliciet gekozen feedback-
of andere concrete gebruikers-/redactie-/API-behoefte. Bij feedbackhervatting
blijft dit besluit vóór `FBK-006` vereist. Al meegeteld bij de 15 onderhoudsacties.

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

Bewust uitstel krijgt een toetsbare trigger. Feedback heeft een concrete
gefaseerde backlog, maar is op gebruikersprioriteit geparkeerd; een bekende
mogelijke consumer is geen opdracht om de infrastructuur nu al te bouwen.
Content, anoniem Learn en de eerste beperkte Atlaslevering blijven file-backed
uitvoerbaar zolang geverifieerde data en gemeten budgetten dat toelaten. Research, bronnen en canonical content blijven bij
iedere migratie behouden. Verdere framework alignment en vergelijkingsfuncties
blijven mogelijke vervolgrichtingen zonder huidige uitvoeringsbelofte.
