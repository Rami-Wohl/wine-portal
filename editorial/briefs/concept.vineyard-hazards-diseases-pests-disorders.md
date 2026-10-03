# Contentbrief — Weerrisico's, ziekten, plagen en stoornissen

Datum: 2026-10-02; afrondingsreview: 2026-10-03  
Roadmapticket: `EXP-014`  
Package: `concept.vineyard-hazards-diseases-pests-disorders`  
Archetype: `concept-system-overview`

## Paginabelofte en ownership

- Na afloop kan de lezer abiotisch gevaar, ziekte, plaag, vector, fysiologische stoornis, symptoom, teken en schade uit elkaar houden.
- De pagina is canonical eigenaar van het overkoepelende risicokader, het wereldwijde basisregister en de cyclus preventie–monitoring–diagnose–interventie–evaluatie.
- `concept.phylloxera` bezit de volledige biologie, crisisgeschiedenis, onderstammen en franc-de-piedcontext van phylloxera.
- `concept.botrytis` bezit het onderscheid tussen grijze en edele rotting en de gevolgen voor edelzoete wijn.
- Klimaatschalen, waterfysiologie, voeding, bodem, loofwand en onderstammen blijven bij hun bestaande eigenaars; EXP-015 bezit certificering en teeltsystemen.
- Echte meeldauw, valse meeldauw, zwartrot, houtziekten, virussen, bacteriën, motten, mijten en nematoden blijven voorlopig hub-owned. Zij krijgen pas een satellite wanneer zoekintentie, hergebruik en zelfstandige narratieve waarde dat rechtvaardigen.

## Kennisdiepte

| Niveau | Functie |
| --- | --- |
| basis | complete begrippen, hoofdrisico's, symptomen versus oorzaken, IPM-cyclus en gevolgen voor druif en oogst |
| verdieping | ziektecyclus, ruimtelijk patroon, timing, culturele en biologische maatregelen |
| gevorderd | chronische en latente schade, resistentieselectie, meerjarige sanering en bewijsgrenzen |

## Claims- en bronnenplan

| Claimfamilie | Bronnen |
| --- | --- |
| geïntegreerde beheersing, monitoring en toepassing | OIV good practices 2018 |
| echte en valse meeldauw | Cornell IPM/CALS |
| vectoroverdracht en diagnostische lookalikes | UC IPM Pierce's disease |
| virusoverdracht, latent aanwezige infectie en houtziekten | UC IPM virus diseases of grape; UC IPM Eutypa dieback |
| zwartrot, infectiereservoirs en selectie van aangetaste trossen | University of Minnesota, diseased grape clusters |
| vorstbescherming en waterverzadigde wortelzones | University of Georgia, vineyard frost protection; AWRI, waterlogged vineyards |
| feromoonverwarring als gerichte maatregel | UC IPM European grapevine moth |
| hitte, droogte, straling en algemene abiotische stress | Bernardo et al. 2018; Gambetta et al. 2021 |
| gespecialiseerde phylloxera- en botrytisclaims | bestaande canonical source sets van beide satellites |
| geografische verschillen in phylloxerarisico en biosecurity | AWRI phylloxera |

## Visual teaching contract

| Visual | Leervraag | Vorm | Grens |
| --- | --- | --- | --- |
| `diagnostic-framework` | Hoe verschillen directe weersschade, infectie, vector en fysiologische ontregeling, en hoe volgt daar een diagnose uit? | taalneutrale, schematisch-naturalistische rasterplaat met cijfers 1–5 | één oorzaakvoorbeeld per paneel; geen diagnose op uiterlijk; geen automatische pesticide- of kwaliteitsimplicatie |

De plaat vergelijkt mechanismen, waaronder onzichtbare overdracht, en is geen
fotografische symptoomsleutel. De caption maakt expliciet dat de vergrotingen
vereenvoudigd zijn en geen gemeenschappelijke schaal hebben. De volledige
uitleg blijft als toegankelijke HTML beschikbaar.

## Iteratielog

- Iteratie 1 — Een encyclopedische lijst is omgebouwd tot vier oorzakencategorieën en één besliscyclus.
- Iteratie 2 — Botrytis en phylloxera zijn als satellites geïntegreerd zonder hun bestaande narratieven te dupliceren.
- Iteratie 3 — De basislaag is uitgebreid tot een wereldwijd register; specialistische epidemiologie en resistentie zijn naar hogere lagen verplaatst.
- Iteratie 4 — De eerste illustratie is afgewezen omdat meerdere symptomen op één wijnstok diagnostische schijnzekerheid gaven. De definitieve plaat scheidt de voorbeelden en maakt hercontrole deel van het proces.
- Iteratie 5 — NL en EN zijn op blok-, link-, bron- en kennisdiepteniveau gelijkgetrokken.
- Iteratie 6 — Specifieke claims over virussen, houtziekten, zwartrot, vorstbescherming, wateroverlast, feromoonverwarring en phylloxerabiosecurity zijn tegen specialistische bronnen gecontroleerd. De OIV-resolutiedatum is gecorrigeerd naar 23 november 2018; een niet-onderbouwde exacte publicatiedatum bij Cornell is verwijderd; de bestaande Gambetta-DOI en publicatiedatum zijn behouden. Symptoomvertraging wordt niet gelijkgesteld aan latentietijd, en vectorrollen worden per ziekteverwekker uitgelegd.
- Iteratie 7 — De browsertest controleert nu werkelijk geladen beeld op 390 en 1440 pixels. Een onmiddellijke reload na het wijzigen van de viewport is verwijderd, zodat de aangepaste beeldrequest kan afronden. Ook een afzonderlijke test zonder desktopbeeldcache slaagt.

## Eindvalidatie

- `npm run content:check`: geslaagd; 350 entities, 531 bronnen en 177 mediarecords.
- `npm run format` en `npm run check`: geslaagd; lint, types, 130 tests en relation-audit.
- `npx playwright test e2e/explore-foundation.spec.ts`: acht browsertests geslaagd; aanvullende cold-loadcontrole van de nieuwe pagina geslaagd.
- Link- en taalaudits uitgevoerd. De globale linkaudit bevat bestaande reviewkandidaten; voor dit nieuwe package zijn geen nieuwe of nog te beoordelen kandidaten gevonden. De taalaudit is een redactionele inventaris, geen foutenteller; de nieuwe NL/EN-tekst is handmatig nagekeken.
- Visuele review op 390 en 1440 pixels: leesbare tekst, geladen illustratie en geen horizontale overflow. Alle kennisdiepten, een directe verwijzing naar een gevorderd blok en de inhoud zonder JavaScript zijn gecontroleerd.
- De package is lokaal actief; commit en deployment vallen buiten deze afronding.

## Publicatiecheck

- [x] Acht coveragevragen zijn afgedekt.
- [x] Foundation is zelfstandig compleet.
- [x] Satellite- en ownershipgrenzen zijn expliciet.
- [x] De illustratie heeft alleen taalneutrale cijfers en een volledige HTML-uitleg.
- [x] Beeld en tekst onderscheiden observatie van diagnose.
- [x] Pipeline, audits, tests en visuele review slagen.
