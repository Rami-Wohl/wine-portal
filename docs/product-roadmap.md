# Overkoepelende productplanning

Bijgewerkt: 2026-10-04. Deze kaart verbindt platformwerk met de bestaande
content- en Learn-roadmaps. Ticketstatus en acceptatiecriteria blijven uitsluitend
in de gekoppelde backlog; dit document maakt de prioriteit en timing expliciet.
De onderbouwing staat in [de sanity review](../editorial/platform-sanity-review-2026-10-04.md).
De [runtime-/CI-review](../editorial/runtime-ci-review-2026-10-04.md) beschrijft
de inmiddels uitgevoerde eerste platformstap. Ook het
[taal- en URL-contract](localization-routing.md) is vastgelegd (`MNT-045`);
de publieke taalwisselaar volgt afzonderlijk in `MNT-046`.

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
| Eerstvolgende externe vrijgave, zodra toegang werkt | `MNT-056`: eerste GitHub-run, mergebescherming en deployment bevestigen | Node 24 en CI zijn lokaal gereed (`MNT-047`); de ongepatchte ontwikkelketen blijft bij `MNT-055` |
| Eerstvolgende uitvoerbare ontwikkeltaak | `EXP-017`: ontvangst, selectie en mostvoorbereiding | De scope-/ownershipreview `EXP-016` is afgerond; bestaande perskennis blijft bij haar owner |
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

Er staan 27 niet-afgeronde tickets geregistreerd: 14 onderhoudsacties, 12
Explore-tickets en één Learn-evaluatie. Een geblokkeerde of geplande actie telt
mee. Deze momentopname wordt bij wijziging van de uitvoeringsvolgorde bijgewerkt;
de gekoppelde backlogs blijven leidend voor actuele status.

De onderstaande ontwikkelvolgorde is het uitgangspunt. Tijdgebonden evaluaties
en vrijgekomen externe controles mogen deze volgorde onderbreken.

| Volgorde | Ticket | Werk |
| ---: | --- | --- |
| 1 | `EXP-017` | Ontvangst, selectie en mostvoorbereiding |
| 2 | `EXP-018` | Gist en alcoholische vergisting |
| 3 | `EXP-019` | Productieroutes en extractie |
| 4 | `MNT-049` | CSS organiseren bij de komende UI-uitbreiding |
| 5 | `MNT-046` | NL/EN-presentatie en taalwisselaar, vóór EXP-020 |
| 6 | `MNT-048` | Pipeline/model organiseren vóór verdere schema-/GIS-uitbreiding |
| 7 | `EXP-020` | Opvoeding en zuurstof |
| 8 | `EXP-021` | Stabilisatie en verpakking |
| 9 | `EXP-022` | Kelderhygiëne en wijnfouten |
| 10 | `EXP-023` | Zoete, mousserende en versterkte wijn |
| 11 | `EXP-024` | Wijnsamenstelling |
| 12 | `EXP-025` | Waarneming en ontwikkeling |
| 13 | `EXP-026` | Integratie graph, links, media en terminologie |
| 14 | `MNT-051` | Geverifieerde Atlaspilot afbakenen vóór EXP-027 |
| 15 | `MNT-052` | Performance- en mediabudgetten vóór grootschalige regiogroei |
| 16 | `EXP-027` | Mondiale toets en regiokeuze |
| 17 | `EXP-028` | Integrale redactionele en product-QA |
| 18 | `MNT-053` | Afzonderlijke migratieronde voor bestaande SVG-illustraties |

Tijdgebonden, in deze onderlinge volgorde:

| Moment | Ticket | Werk |
| --- | --- | --- |
| Vroegst 2026-10-22 bij voldoende werkelijk gebruik | `LRN-012` | Learn-pilot evalueren en vervolg kiezen |
| Aansluitend, of eerder bij een concrete consumer | `MNT-050` | Backend/API/databasebesluit |

Geblokkeerd, in aanbevolen oppakvolgorde zodra de genoemde afhankelijkheid
beschikbaar is:

| Prioriteit bij vrijgave | Ticket | Afhankelijkheid |
| ---: | --- | --- |
| 1 | `MNT-056` | Gepushte workflow en toegang tot GitHub/Vercel voor externe verificatie |
| 2 | `MNT-055` | Compatibele upstreampatch voor braces; handmatige hercontrole uiterlijk 2026-10-18 |
| 3 | `MNT-002` | Geverifieerde Atlasdata voor Bordeauxkaart |
| 4 | `MNT-014` | Officiële Barsac-/Sauternes-geometrie |
| 5 | `MNT-013` | Wereldwijde druivenverspreidingsdata |
| 6 | `MNT-020` | Ontbrekende producentenfoto's met aantoonbare hergebruikrechten |
| 7 | `MNT-039` | Definitief officieel EU-besluit Graves Supérieures |

Status en acceptatiecriteria staan in de [onderhoudsbacklog](maintenance-backlog.md),
[Explore-roadmap](explore-foundation-roadmap.md) en [Learn-roadmap](learn-roadmap.md).

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
