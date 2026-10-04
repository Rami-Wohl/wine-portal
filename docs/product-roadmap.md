# Overkoepelende productplanning

Bijgewerkt: 2026-10-04. Deze kaart verbindt platformwerk met de bestaande
content- en Learn-roadmaps. Ticketstatus en acceptatiecriteria blijven uitsluitend
in de gekoppelde backlog; dit document maakt de prioriteit en timing expliciet.
De onderbouwing staat in [de sanity review](../editorial/platform-sanity-review-2026-10-04.md).

## Waar we staan

De entity-first basis werkt: YAML bewaart gedeelde kennis, NL/EN-Markdown legt
haar uit en een gevalideerde build levert de runtimebundle. Explore, zoeken,
verdiepingen en de eerste Learn-pilot werken op dezelfde graph. Voortgang staat
los van content en wordt anoniem in de browser opgeslagen.

De publieke applicatie presenteert nog alleen Nederlands. Atlas heeft nog geen
geverifieerde dataset. Er is een Next.js-server, maar geen accountdatabase,
remote voortgang, redactiebackend of externe publieke API. Engelse authoring en
een async repositoryinterface bereiden uitbreidingen voor; zij maken deze
features niet automatisch gereed.

## Aanbevolen uitvoeringsvolgorde

| Moment | Werk | Reden en grens |
| --- | --- | --- |
| Eerstvolgende platformtaak, vóór volgende release | `MNT-047` + `MNT-055`: Node 24 LTS toetsen/vastleggen, ontwikkeldependencies herstellen en CI toevoegen | Ondersteunde runtime en herhaalbare kwaliteitscontrole vóór verdere groei; controleer ook deploymentinstellingen |
| Meteen daarna, vóór nieuwe route-uitbreidingen | `MNT-045`: taal- en URL-contract | Voorkom dat navigatie, metadata en steeds meer routes alleen Nederlands veronderstellen |
| Volgende contenttaak | `EXP-017`: ontvangst, selectie en mostvoorbereiding | De scope-/ownershipreview `EXP-016` is afgerond; bestaande perskennis blijft bij haar owner |
| Aanbevolen vóór `EXP-020` | `MNT-046`: NL/EN-presentatie en taalwisselaar | Toets de reeds geschreven Engelse content in het echte product; los metadata, zoeken en Learn mee op |
| Vóór volgende schema-/GIS-uitbreiding; bij bredere UI-wijziging | `MNT-048` en `MNT-049`: pipeline/model en CSS organiseren | Houd verantwoordelijkheden voor menselijke reviewers herkenbaar, met behoud van gedrag |
| Samen met pilotevaluatie, vroegst 2026-10-22 bij genoeg gebruik | `LRN-012` en `MNT-050`: Learn-vervolg en platformopslag besluiten | Accounts, cross-device voortgang, quizzen en personalisatie moeten een bewezen doel dienen; vervroeg het opslagbesluit bij een concrete consumer |
| Bronverkenning vóór `EXP-027` | `MNT-051`: beperkte Atlaspilot | Geef de drie geblokkeerde kaarttickets een uitvoerbaar datatraject; wereldwijde druivenverspreiding vraagt andere gegevens dan appellationgrenzen |
| Vóór grootschalige uitbreiding naar volgende regio's | `MNT-052`: performance- en mediabudgetten | Meet build, serverzoekwerk, browserbundles en beelden voordat storage-/searcharchitectuur verandert |
| Afzonderlijke illustratieronde | `MNT-053`: resterende SVG-diagrammen vervangen | Sluit aan op de gewenste rasterstijl met behoud van de didactische betekenis |

Dit is een aanbevolen afwisseling van platform- en contentwerk, geen eis om
alle content stil te leggen tot elk onderhoudsticket af is. De onderlinge
inhoudelijke volgorde `EXP-017` t/m `EXP-028` blijft intact.

## Volledige uitvoeringsvoorraad op de peildatum

Er staan 28 niet-afgeronde tickets geregistreerd: 15 onderhoudsacties, 12
Explore-tickets en één Learn-evaluatie. Een geblokkeerde of geplande actie telt
mee. Deze momentopname wordt bij wijziging van de uitvoeringsvolgorde bijgewerkt;
de gekoppelde backlogs blijven leidend voor actuele status.

| Backlog | Niet-afgerond werk |
| --- | --- |
| [Onderhoud](maintenance-backlog.md) | `MNT-002` Bordeauxkaart; `MNT-013` druivenverspreiding; `MNT-014` Barsac/Sauternes-geometrie; `MNT-020` ontbrekende producentenfoto's; `MNT-039` officieel EU-besluit Graves Supérieures; `MNT-045` taalcontract; `MNT-046` taalpresentatie; `MNT-047` runtime/CI; `MNT-048` pipeline/model; `MNT-049` CSS; `MNT-050` backendbesluit; `MNT-051` Atlaspilot; `MNT-052` performance/media; `MNT-053` SVG-migratie; `MNT-055` ontwikkeldependencies |
| [Explore](explore-foundation-roadmap.md) | `EXP-017` ontvangst/most; `EXP-018` gist/vergisting; `EXP-019` productieroutes/extractie; `EXP-020` opvoeding/zuurstof; `EXP-021` stabilisatie/verpakking; `EXP-022` hygiëne/fouten; `EXP-023` zoet/mousserend/versterkt; `EXP-024` wijnsamenstelling; `EXP-025` waarneming/ontwikkeling; `EXP-026` graph/links/media/terminologie; `EXP-027` mondiale toets; `EXP-028` integrale QA |
| [Learn](learn-roadmap.md) | `LRN-012` werkelijk gebruik evalueren en vervolg kiezen |

De regiokeuze in `DEC-EXP-005` hoort bij `EXP-027`, niet bij een extra los
uitvoeringsticket. Overige Learn-productkeuzes blijven bij `LRN-012`. Draftentities
zijn een contentvoorraad; ieder draftrecord is niet automatisch een te schrijven
zelfstandige pagina.

## Wanneer een backend of database wél nodig wordt

- **Accounts en synchronisatie:** een aparte gebruikersdatalaag met authenticatie,
  autorisatie en betrouwbaar voortgangs-/conflictenbeheer. Behoud stable path- en
  step-ID's en ontwerp migratie van bestaande browservoortgang.
- **Redactionele samenwerking:** bespreek rollen, review/publicatie, audittrail en
  export voordat een CMS of schrijf-API canonical ownership overneemt.
- **Externe consumers:** ontwerp een versieerbaar API-contract wanneer er een
  echte afnemer is; de huidige serverrenderer hoeft niet eerst via een eigen
  REST-API zijn eigen data terug te lezen.
- **Zoeken en geografie:** kies aanvullende opslag/querying op gemeten volume en
  vereiste queries. Een kleine geverifieerde Atlasdataset kan starten zonder
  PostGIS; omvang alleen is onvoldoende reden om alle authored content te migreren.

De uitkomst kan bewust uitstel zijn, mits de trigger voor herbeoordeling vastligt.
Bestaande research, bronnen en canonical content blijven bij elke migratie
behouden. Communitycorrecties, fijnmaziger framework alignment en vergelijkings-
functies blijven mogelijke vervolgrichtingen uit de architectuur, zonder huidige
uitvoeringsbelofte.
