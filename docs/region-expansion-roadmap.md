# Regionale uitbreidingsfase

Bijgewerkt: 2026-10-12. Deze fase volgt op de Explore-basis; de prioriteit ten
opzichte van platformwerk staat in [product-roadmap.md](product-roadmap.md).
Onderbouwing: [codebase-review](../editorial/codebase-health-review-2026-10-11.md).
Dit plan wijzigt geen canonical schema, publicatiecontract of geverifieerd feit.

## Volgorde en beslispoorten

| Ticket | Status | Scope en voltooiingsvoorwaarde |
| --- | --- | --- |
| `REG-001` | open | Landen-/plaatshiërarchie en geografiestrategie besluiten vóór publicatie van de volgende regiobatch. Vergelijk landen als `region` met een expliciet plaatsniveau versus een apart model; behandel bestuurlijke geografie, wijnregio en beschermde oorsprong afzonderlijk. Leg relaties, grensoverschrijdende uitzonderingen, filters en een additieve migratie vast. Behoud bestaande IDs. Kies per geografisch gebruik het vereiste dataniveau en een bron-/licentie-/updatepad; `MNT-051` bezit de concrete Bordeaux-Atlaspilot. |
| `REG-002` | open | Druiven op regionale dependency en wereldwijd leerbelang prioriteren; publiceer een geordende eerste batch en vervolgvoorraad. Toets of de twaalf dekkingsdimensies met kortere, proportionele prose uitvoerbaar zijn. Een lichtere publicatievorm vereist eerst expliciete criteria en schema-/validatorbesluit; geen ongereviewde korte pagina's als automatische bypass. Gereed wanneer prioriteiten en het geldende publicatiecontract toetsbaar zijn, niet wanneer een willekeurig quotum van veertig is gehaald. |
| `REG-003` | open | Mondiale inhoudsgaten van corpusverwijzing naar owner en afgebakende publicatiebatches brengen. Onderzoek oorsprongsbescherming/wijnrecht; soorten, kruisingen/hybriden en massale selectie; wijngaardaanleg, plantdichtheid, rijoriëntatie en leeftijd; oogstmethode, selectieve pluk en logistiek. Leg per vraag bestaande owner, echte gap, bronnenbehoefte, NL/EN-anker en uitvoeringsvolgorde vast. Maak voor onafhankelijk uitvoerbare batches aparte contenttickets vóór uitvoering; een inventaris voltooit die content niet. `EXP-026` bezit de aanvullende terminologie-/ownershipcontrole. |
| `REG-004` | open | Eerste regionale pilot publiceren, voorlopig Loire, na `REG-001–003`, `MNT-052` en `EXP-028`. Definitieve keuze via `DEC-EXP-005`; publiceer alleen de geverifieerde scope en haar noodzakelijke dependencies, volgens onderstaande definitie. |
| `REG-005` | open | Contrasterende tweede pilot publiceren, voorlopig Mendoza. Hergebruik de bestaande draftidentiteit als de gekozen scope past. Pas de lessen uit de eerste pilot toe; bevestig bronnen, geografische scope en regioselectie vóór authoring. Daarna besluitvorming over verdere regiobatches op basis van gemeten capaciteit, ontbrekende druiven en leerwaarde. |

`REG-001–003` kunnen als planning naast de resterende Explore-integratie lopen.
Hun beslissingen moeten vóór de betreffende regionale publicatie zijn genomen;
zij blokkeren geen correcties of bestaande content. `EXP-027` toetst mondiale
claims met bronnen en voorbeelden en vereist niet dat beide pilotregio's al
volledig gepubliceerd zijn. Zo ontstaat geen circulaire afhankelijkheid.

Loire en Mendoza zijn **voorlopige kandidaten**, geen goedgekeurde publicatie-
volgorde voor alle wijnregio's. Een volgende selectie kan bijvoorbeeld een
ander klimaat, juridisch systeem of druivenpakket testen; de benodigde
feitelijke scope volgt uit onderzoek, niet uit een vooraf gekozen aantal landen.

## Definitie van gereed per regiobatch

- Afgebakende place-/wijnregio-identiteit, stabiele IDs en geverifieerde parents
  en relaties; beschermde oorsprong wordt niet gelijkgesteld aan geografie.
- Goedgekeurde brief en contentplan met alle verplichte dekkingsdimensies;
  dependencies hebben een geschikte bestaande owner of een expliciete vervolgbatch.
  Een actieve pagina vereist geen draftbestemming voor essentiële uitleg.
- Geverifieerde claims, primaire bronnen waar vereist, provenance, reviewdatum
  en gelijkwaardige NL/EN-uitleg met stabiele anchors.
- Relevante druiven, wijnnamen, producentenvormen en juridische termen zijn
  vindbaar zonder duplicate entities of een Bordeauxmodel als stilzwijgende norm.
- Beelden passen bij de huisstijl en hebben rechten, alttekst en proportionele
  afmetingen. Kaarten gebruiken alleen geverifieerde data; een regio kan zonder
  kaart verschijnen als die ontbreekt, met een expliciete Atlasvervolgactie.
- Search, browse, backlinks, locale-routing, kennisdieptes en responsive weergave
  zijn gecontroleerd; de budgetten uit `MNT-052` blijven gehaald.
- Format, check en relevante browserchecks slagen; publicatiereview en resterende
  gaps zijn geregistreerd. Feitelijke review wordt niet vervangen door tests.

## Learn en backend

Het achtlessencurriculum uit `LRN-013` is goedgekeurd via `DEC-LRN-015`;
alle acht NL/EN-lessen en het volledige wijngaardpad zijn actief (`LRN-014–017`).
Wijngaardlessen en pathpublicatie via `LRN-014–017` mogen sinds het
gebruikersbesluit van 2026-10-12 vóór werkelijk pilotgebruik; `LRN-012` blijft
het afzonderlijke evaluatiebesluit. Atlasafbakening via `MNT-051` krijgt een
zichtbare plaats vóór brede regiogroei; bouw vereist geverifieerde data. Accounts, API en databases
blijven bij `MNT-050`. Een afgeleide searchdatabase kan een afzonderlijke
performanceoplossing zijn zonder canonical Markdown/YAML naar een CMS te migreren.
