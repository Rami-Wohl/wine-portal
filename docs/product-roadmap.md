# Overkoepelende productplanning

Bijgewerkt: 2026-10-30. Deze kaart bepaalt volgorde en timing; actuele status
en acceptatiecriteria staan in de gekoppelde domeinbacklogs. Gedateerde
onderzoeksresultaten blijven in het [reviewregister](quality-assurance.md#reviewregister).

## Waar we staan

De entity-first basis werkt: gedeelde YAML, gelijkwaardige NL/EN-Markdown,
strict gevalideerde graph, server-only repository en gedeelde presentatie.
Ontdekken, zoeken, vijftien actieve lessen en twee Learn-paden gebruiken deze
basis. Browservoortgang staat los van authored content. Het volledige
wijngaardpad en de eerste Port/Sherry/Champagne-batch zijn gepubliceerd;
EXP-026 heeft hun graph, links en terminologie geïntegreerd.

Er is een Next.js-server, maar geen accountdatabase, remote voortgang,
redactiebackend of externe publieke API. De contentrepository heeft synchrone
lookups; de voortgangsadapter heeft een async interface.

## Gebruikersbesluit 2026-10-30: inhoud eerst, Atlas achteraan

**Leren en Ontdekken krijgen voorrang.** Atlas wordt uitgesteld omdat de
gebruiker een andere aanpak wil, zonder al een nieuw ontwerp te kiezen.
De Atlaspagina, navigatielinks, home-ingang en specifieke styling zijn verwijderd;
`/atlas` en `/en/atlas` zijn geen beschikbare productroutes meer.
Geen Atlasvoorbereiding, geografiemodel, import of kaartwerk als voorwaarde
voor nieuwe lessen, cataloguspagina's of regionale content.

De afbakening uit MNT-051 blijft afgeronde research. Het
[oude pilotvoorstel](atlas-pilot-contract.md) is **geen actief implementatiecontract**.
De vijf overgebleven Atlastickets staan onderaan, na alle overige werksporen.
Hervatting vereist een expliciete gebruikersopdracht, een nieuwe scope-/ontwerpkeuze
en hercontrole van bronversies, rechten en bruikbaarheid. Geen automatische hervatting.

- **Bestaande contentkwaliteit eerst:** MNT-072 corrigeert het Pomerol-brongebruik
  en blijft urgent, ook zonder Atlas. De bronlabelcorrectie alleen voltooit
  de NL/EN-claimreview niet.
- **Leren:** LRN-018 bereidt een volgend curriculum en concrete lessonbatches
  voor op basis van bestaande naslag en leervragen. De curriculumbrief vraagt
  eigen goedkeuring vóór authoring; accounts, Atlas en werkelijk pilotgebruik
  zijn geen voorwaarden voor voorbereiding of meer lessen.
- **Ontdekken:** EXP-027 toetst mondiale aannames; EXP-028 controleert de
  foundation. Daarna volgen de drie resterende EXP-032-batches: zoet,
  mousserend en versterkt. REG-001–003 bereiden regionale content voor;
  kaartbouw maakt geen deel uit van hun huidige opdracht.
- **Feedback en platform blijven geparkeerd:** FBK-001 is een lokale ontwerpproef;
  FBK-002–034 en MNT-050 worden niet stilzwijgend hervat. Zie de
  [overdracht](feedback-roadmap.md#prioriteit-en-hervatpunt--besluit-2026-10-12).
- **Onderhoud volgt concrete noodzaak:** MNT-065 vóór grote corpusbatches;
  MNT-064 alleen bij gemeten kosten. Geen brede platformronde vóór iedere les.
- **Securityronde 2026-10-30:** Next 16.4.3, Node 24.22.2 LTS en compatibele
  dependency-updates; volledige en productieaudit schoon. MNT-055 afgerond,
  ESLint-10-peercompatibiliteit apart als MNT-073 (hercontrole uiterlijk 30 november).
  [Review en auditbewijs](../editorial/dependency-security-review-2026-10-30.md).
- **Tijdgebonden checks:** LRN-012 vereist werkelijk gebruik of gerichte
  gesprekken, niet alleen een verstreken datum. Daarover is geen nieuw bewijs
  aangeleverd. MNT-056 bewaart de resterende externe acceptatie. De gebruiker
  bevestigde eerder geslaagde Actions; de huidige update moet nog gecommit,
  gepusht en gedeployd worden voor externe verificatie.

## Volledige uitvoeringsvoorraad op de peildatum

60 niet-afgeronde tickets: 17 onderhoudsacties, 3 Explore-tickets, 5 regionale
planning-/publicatietickets, 2 Learn-tickets en 33 feedbacktickets. LRN-018 is
nieuw toegevoegd zodat Leren een concreet vervolg heeft naast gebruiksevaluatie.
Beslispunten zijn gates, geen extra implementatietickets; toekomstige authoringbatches
krijgen eigen tickets zodra hun scope vaststaat. Dit is geen volledige mondiale contentlijst.

## Actieve volgorde: Leren en Ontdekken

| Volgorde | Ticket | Werk |
| ---: | --- | --- |
| 1 | `MNT-072` | Pomerol-bron en afhankelijke NL/EN-claims en assertion controleren |
| 2 | `LRN-018` | Volgend curriculum en eerste lessonbatch voorstellen; bestaande naslag en echte gaps afwegen |
| 3 | `EXP-027` | Mondiale claims toetsen; klimaat-/regiocontrasten en DEC-EXP-005 bevestigen |
| 4 | `EXP-028` | Integrale redactionele en product-QA van de foundation |
| 5 | `EXP-032` | Resterende catalogusbatches: zoetheidscontrasten → mousserend → versterkt/Manzanilla |
| 6 | `REG-003` | Mondiale inhoudsgaten omzetten in concrete contentbatches |
| 7 | `REG-002` | Druivenprioriteiten en proportioneel publicatiecontract toetsen |
| 8 | `REG-001` | Landen-/plaatsidentiteit en relaties voor tekstuele regionale publicatie besluiten, zonder Atlasbouw |
| 9 | `REG-004` | Eerste regionale pilot, voorlopig Loire, na inhoudelijke publicatiegates |
| 10 | `REG-005` | Contrasterende regionale pilot, voorlopig Mendoza |
| 11 | `MNT-060` | Documentatieconsolidatie met behoud van contracten en historie |
| 12 | `MNT-065` | Representatieve benchmarks; vóór een daadwerkelijk grote corpusbatch uitvoeren |
| 13 | `MNT-061` | Getypeerde UI-berichtencatalogus |
| 14 | `MNT-062` | Browsertestcontracten en risicogerichte contentsampling |
| 15 | `MNT-053` | Bestaande SVG-illustraties naar rasterstijl migreren |
| 16 | `MNT-064` | Fixture-I/O alleen optimaliseren bij gemeten setupkosten |

Na curriculumakkoord krijgen concrete Learn-authoringbatches direct een plek
naast de toepasselijke Explore-batch; ze wachten niet op de volledige catalogus
of regionale publicaties. De volgorde bewaart inhoudelijke publicatiegates,
maar maakt geparkeerde Atlas- of feedbackbouw geen voorganger.

Tijdgebonden: **LRN-012**, vroegst 2026-10-22 en alleen met voldoende werkelijk
gebruik of gerichte gesprekken. Zonder bewijs blijft het ticket gepland;
nieuwe lessen hoeven daarop niet te wachten.

## Externe afhankelijkheden

In aanbevolen oppakvolgorde zodra beschikbaar; geen Atlaswerk in deze groep.

| Volgorde bij vrijgave | Ticket | Afhankelijkheid |
| ---: | --- | --- |
| 1 | `MNT-056` | Repository-/branchbescherming en Vercel-acceptatie; Actions eerder door gebruiker bevestigd |
| 2 | `MNT-073` | ESLint 10 zodra de lintpluginpeerketen compatibel is; hercontrole uiterlijk 2026-11-30 |
| 3 | `MNT-020` | Producentenfoto's met aantoonbare hergebruikrechten |
| 4 | `MNT-039` | Definitief officieel EU-besluit Graves Supérieures |

## Geparkeerd platform en feedback

MNT-050 blijft de platformgate vóór eventuele databasebouw. Feedback hervat
uitsluitend op expliciet prioriteitsbesluit, in deze volgorde:

| Fase | Tickets | Werk |
| --- | --- | --- |
| 0 | `FBK-002–005` | Eerst FBK-003/DEC-FBK-011; daarna beleid, providerproef en privacy-/operationele keuzes |
| 1 | `FBK-006–025` | Accounts, meldingen, moderatie, mail, misbruik/beroep en rechten; lancering via FBK-025 en MNT-056 |
| 2 | `FBK-026–031` | Selectie, Mijn meldingen, versieverschil, correctielog, opt-in-credit en GitHubkoppeling |
| 3 | `FBK-032–034` | Vertrouwde bijdragers en Learn-sync; sync wacht op LRN-012 en DEC-FBK-019 |

## Atlas — achteraan, uitsluitend na nieuwe ontwerpkeuze

Alle vijf tickets zijn **geparkeerd**, ook als hun oude datablokkade oplost.
Onderstaande volgorde is alleen een historisch aanknopingspunt; eerst opnieuw
ontwerpen en bepalen welke tickets nog passen. Het negen-appellationvoorstel
is geen vastgelegde toekomstkeuze.

| Eerder verband | Ticket | Te herbeoordelen richting |
| ---: | --- | --- |
| 1 | `MNT-070` | Geografiemodel en repositorygrens |
| 2 | `MNT-071` | Gecontroleerde data-import en publicatiereview |
| 3 | `MNT-002` | Publieke Atlas-/Bordeauxkaart |
| 4 | `MNT-014` | Kaartintegratie Barsac/Sauternes |
| 5 | `MNT-013` | Wereldwijde druivenverspreidingsdata |

Status en acceptatiecriteria staan in de [onderhoudsbacklog](maintenance-backlog.md),
[Explore-roadmap](explore-foundation-roadmap.md), [Learn-roadmap](learn-roadmap.md),
[regionale roadmap](region-expansion-roadmap.md) en [feedbackroadmap](feedback-roadmap.md).

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
Content en anoniem Learn blijven file-backed uitvoerbaar zolang de gemeten
budgetten dat toelaten. Atlas is geen huidige consumer voor infrastructuurbouw. Research, bronnen en canonical content blijven bij
iedere migratie behouden. Verdere framework alignment en vergelijkingsfuncties
blijven mogelijke vervolgrichtingen zonder huidige uitvoeringsbelofte.
