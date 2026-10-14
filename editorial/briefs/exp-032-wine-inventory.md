# EXP-032 — Inventaris individuele wijnen

Peildatum: 2026-10-13. Eerste afbakening, geen universele juridische taxonomie.
De drie families blijven zelfstandige ingangen. Een wijn kan meer dan één familie
raken; een druif, techniek of merk wordt daardoor geen nieuwe wijnappellation.

## Bestemmingen en batchvolgorde

| Naam | Identiteit en passende bestemming | Uitvoering |
| --- | --- | --- |
| Port / Porto | Beschermde herkomst: `appellation.port`; ruby/tawny/Vintage/LBV/colheita voorlopig onderdelen daarvan | Batch 1, huidige levering |
| Sherry / Jerez-Xérès-Sherry | Beschermde herkomst: `appellation.sherry`; droge en zoete categorieën binnen die scope | Batch 1, huidige levering |
| Champagne | Beschermde herkomst: `appellation.champagne`; onderscheid met `region.champagne` | Batch 1, huidige levering |
| Sauternes | Bestaande actieve `appellation.sauternes`, inclusief relatie met Barsac | Hergebruik; EXP-026 controleert familielinks |
| passito | Bestaande actieve `concept.passito`: wijnbenaming rond gedroogde druiven; niet één beschermde herkomst | Hergebruik, geen duplicaat |
| vin de paille | Bestaande actieve `concept.vin-de-paille`: traditionele wijnbenaming; plaatselijke regels horen bij hun appellation | Hergebruik, geen duplicaat |
| Tokaji Aszú | Specifieke wijncategorie binnen Tokaj; `region.tokaj` alleen de regionale ouder. Beoogd `concept.tokaji-aszu`, identiteit toetsen aan actuele product specification | Batch 2: zoetheidscontrasten |
| Eiswein / Icewine | Wijnbenaming met rechtsgebiedafhankelijke voorwaarden, beoogd `concept.icewine`; techniek natuurlijke bevriezing onderscheiden van cryo-extractie | Batch 2 |
| Vin Santo | Regionale wijnfamilie met meerdere beschermde uitvoeringen, beoogd `concept.vin-santo`; geen fictieve overkoepelende DOP | Batch 2 |
| Prosecco | Naam komt voor in verschillende beschermde herkomsten; begin met `appellation.prosecco` voor de DOC, inventariseer aparte DOCG-bestemmingen vóór authoring. Glera is een druif | Batch 3: mousserende contrasten |
| Cava | Beschermde herkomst, beoogd `appellation.cava`; juridisch gebied niet als één aaneengesloten regio tekenen | Batch 3 |
| Asti | Beschermde herkomst, beoogd `appellation.asti`; Asti en Moscato d’Asti binnen de juiste regels uit elkaar houden | Batch 3 |
| Cap Classique | Zuid-Afrikaanse wijn-/productiebenaming, beoogd `concept.cap-classique`; geen appellation uit de naam afleiden | Batch 3 |
| Madeira | Beschermde herkomst, beoogd `appellation.madeira`; eiland, verhittingswijze en druif afzonderlijk behandelen | Batch 4: versterkte contrasten |
| Rutherglen Muscat | Regionale wijncategorie, beoogd `concept.rutherglen-muscat`; bestaande `region.rutherglen` is ouder, Muscat de druivencontext | Batch 4 |
| Manzanilla-Sanlúcar de Barrameda | Zelfstandige beschermde herkomst naast Sherry; beoogd eigen appellation, niet een synoniem/alias van `appellation.sherry` | Batch 4, met grenscontrole tegenover Sherry |

Toekomstige IDs zijn voorstellen: pas scaffolden nadat een eigen bron- en
scopecontrole een zelfstandig herbruikbare bestemming bevestigt. Individuele
merken/flessen vallen buiten deze inventaris; hiervoor is geen nieuwe
productencatalogus of schemauitbreiding nodig. Subcategorieën zoals Vintage Port,
Fino of blanc de blancs krijgen pas eigen entities bij aantoonbare zelfstandige
zoek-/uitlegbehoefte, met behoud van de verwijzing naar de huidige eigenaar.

## Wanneer verder

Na batch 1 volgt **EXP-026**, vervolgens Atlasafbakening en de reeds geplande
regionale/contentgates. Batches 2 → 3 → 4 worden na EXP-028 uitgevoerd, vóór de
grote regionale publicatiepilots; hun pagina's krijgen ieder opnieuw de
integratie- en publicatiechecks. Daardoor schuift deze catalogus de eerstvolgende
Atlasvoorbereiding niet op. REG-003 kan de batchomvang bijstellen op basis van
daadwerkelijke les-/regiodependencies; dat besluit moet expliciet worden vastgelegd.

## Resterende regionale en druivenmonografieën

De nieuwe regionale ouders Douro, Jerez en Champagne en de benodigde
druivenrecords blijven drafts. Bestaande Chardonnay en Touriga Nacional blijven
eveneens op hun eigen publicatiepad. REG-002/003 prioriteren hun onderzoek;
het aanmaken van een relatie is geen gereedmelding van een monografie. De actieve
appellationpagina's dragen zelf de noodzakelijke lokale uitleg.

EXP-032 blijft open totdat iedere vervolgbatch gepubliceerd of afzonderlijk
gemotiveerd opgelost is. De reeds bestaande pagina's behouden hun identiteit,
bronnen en actieve inhoud.
