# Contentbrief — Bloei, vruchtzetting en opbrengstvorming

Datum: 2026-09-25  
Roadmapticket: `EXP-006`  
Voorgesteld package: `concept.flowering-fruit-set-yield`  
Archetype: `concept-system-overview`

## Voorkennis, paginabelofte en ownership

- Veronderstelde voorkennis: de lezer kent de organen van de wijnstok en kan bloei en vruchtzetting in de jaarlijkse cyclus plaatsen.
- Na afloop begrijpt de lezer hoe bloemaanleg, bloei, bestuiving, bevruchting, vruchtzetting, trosbouw en opeenvolgende opbrengstcomponenten samen de uiteindelijke oogst vormen.
- Deze pagina is de canonical eigenaar van het reproductieve systeem tussen bloemvorming en oogstopbrengst.
- Deze pagina bezit bewust niet de volledige jaarlijkse fenologie, latere beschemie en rijpheid, of alle details van snoei en loofwandbeheer.
- Parenthub of bovenliggende context: `concept.grapevine-phenology` en `concept.vine-as-living-system`.

## Entitybesluit

- [x] De satellite-toets is toegepast.
- `concept.coulure` blijft een zelfstandige satellite: de term is veelgebruikt, wordt vaak met millerandage verward en wordt al vanuit druivenrassen gelinkt.
- `concept.millerandage` wordt een zelfstandige satellite om dezelfde vindbaarheids- en onderscheidingsreden.
- Bloembiologie, vruchtzetting, trosarchitectuur, opbrengstcomponenten en opbrengstschatting blijven hub-owned; zij krijgen nu geen losse entities.
- De satellites herhalen de volledige opbrengstketen niet, maar linken impliciet via de graph naar deze hub.

## Lezersvragen en coverage

| Coverage key | Lezersvragen | On-page / target / buiten scope | Reden |
| --- | --- | --- | --- |
| identity-and-scope | Wat omvat reproductieve opbrengstvorming en waar begint en eindigt zij? | on-page | Nodig als systeemkader. |
| system-components-and-relationships | Welke onderdelen verbinden knop, bloeiwijze, bloem, bes en tros? | on-page | Kern van de hub. |
| mechanisms-and-interactions | Hoe verlopen kapval, bestuiving, bevruchting, vruchtzetting en vroege besbehoud? | on-page | Essentieel causale route. |
| conditions-and-variation | Hoe veranderen ras, weer, licht, reserves, voeding, water en vegetatieve groei de uitkomst? | on-page | Verklaart spreiding zonder recepten. |
| decisions-and-trade-offs | Welke keuzes verschuiven bloemgetal, zetting, trosdichtheid en crop load? | on-page | Verbindt biologie met teelt. |
| global-context-and-examples | Blijft de uitleg geldig in verschillende klimaten, rassen en teeltsystemen? | on-page | Voorkomt Bordeaux- of koelklimaatnorm. |
| evidence-and-limits | Hoe worden fruit set, coulure, millerandage en opbrengst gemeten en waar ontstaat schijnzekerheid? | on-page | Nodig voor correcte interpretatie. |
| practical-interpretation | Wat betekenen aantal, grootte en compactheid van trossen voor wijngaard en druif? | on-page | Sluit het systeem af zonder kwaliteitsgarantie. |

## Sectie-outline en kennisdiepte

| Block-ID en werktitel | Coverage | Kernidee | Depth en reden | Begrippen/links | Sources nodig | Visualvraag |
| --- | --- | --- | --- | --- | --- | --- |
| `overzicht` | identity-and-scope | Opbrengst ontstaat via meerdere opeenvolgende filters. | foundation | fenologie, levende wijnstok | reviews | Systeem wordt verderop zichtbaar. |
| `opbouw-en-samenhang` | system-components-and-relationships | Een oogst begint in de knop van het vorige seizoen en eindigt in aantallen en massa. | foundation + intermediate detail | phenology | flowering review, Cornell | Geen tweede tijdlijn nodig. |
| `werking` | mechanisms-and-interactions | Van groene bloem en kapval naar bestuiving, bevruchting en bes. | foundation + intermediate/advanced details | coulure, millerandage | flowering review, Dry | Zevendelige procesplaat. |
| `omstandigheden-en-variatie` | conditions-and-variation | Genotype, toestand, weer en timing werken samen. | foundation + intermediate | vine system | reviews | Visual toont variatie, niet oorzaken. |
| `keuzes-en-afwegingen` | decisions-and-trade-offs | Snoei, scheut- en bladbeheer veranderen verschillende componenten tegelijk. | foundation + intermediate | latere EXP-012-owner | Cornell, Dry | Geen receptendiagram. |
| `wereldwijde-context` | global-context-and-examples | Hetzelfde systeem levert verschillende trosvormen en teeltdoelen. | foundation | geen | synthese | Geen regio als norm. |
| `meten-en-vergelijken` | evidence-and-limits | Fruit-setpercentage en opbrengstschatting vereisen juiste noemers en representatieve steekproeven. | intermediate + advanced | satellites | Dry, AWRI | Yieldcomponenten in HTML. |
| `betekenis-voor-wijn` | practical-interpretation | Opbrengst, trosdichtheid en gelijkmatigheid beïnvloeden risico en grondstof, niet automatisch kwaliteit. | foundation | botrytis later | Tello | Geen smaakvoorspelling. |

## Wereldwijde voorbeeldmatrix

| Voorbeeld | Welke variatie of grens toont het? | Waarom dit voorbeeld? | Risico op regionale overweging |
| --- | --- | --- | --- |
| Rassen met weinig bloemen maar redelijke zetting | Lage berry count is niet automatisch slechte vruchtzetting. | Corrigeert een belangrijke meetfout. | Geen regio nodig. |
| Koele/natte en warme/droge bloeiperioden | Temperatuur, vocht en koolstofbeschikbaarheid werken via verschillende routes. | Toont dat één weerlabel onvoldoende is. | Geen klimaat als universeel ideaal. |
| Wijn- en tafeldruiventeelt | Gewenste trosbouw en inzet van groeiregulatoren verschillen. | Begrensd voorbeeld van doelafhankelijk beheer. | Tafelpraktijk niet generaliseren naar wijn. |
| Noordelijk en zuidelijk halfrond | Maanden wisselen, biologische volgorde blijft gelijk. | Sluit aan op fenologiehub. | Geen kalendermaanden in kernuitleg. |

Vervangingstest: het mechanisme blijft hetzelfde zonder Bordeaux, Australië of een ander beroemd referentiegebied; voorbeelden dragen alleen variatie en meetgrenzen.

## Dependency- en begrippenplan

| Kandidaat | Besluit | Canonical owner / target | Nodig vóór publicatie? |
| --- | --- | --- | --- |
| Jaarcyclus/fenologie | hergebruik | `concept.grapevine-phenology` | ja |
| Wijnstok als systeem | hergebruik | `concept.vine-as-living-system` | ja |
| Coulure | bestaande satellite volledig uitwerken | `concept.coulure` | ja |
| Millerandage | nieuwe satellite | `concept.millerandage` | ja |
| Troscompactheid | hub-owned | `trosbouw-en-compactheid` | ja |
| Yield estimation | hub-owned | `meten-en-vergelijken` | ja |
| Snoei/crop load/canopy | uitbesteed | `EXP-012` | nee; alleen relevante verbinding |
| Besrijpheid | uitbesteed | `EXP-007` | nee |

## Claims en bronnenplan

| Coverage / claimfamilie | Algemene synthese of specifieke claim | Passende bronsoort | Status |
| --- | --- | --- | --- |
| Bloemvorming en bloei | algemene synthese | peer-reviewed review + Cornell | supported |
| Definities fruit set, coulure en millerandage | specifieke terminologie | peer-reviewed vergelijkend onderzoek | supported |
| Troscompactheid | algemene synthese | state-of-the-art review | supported |
| Opbrengstcomponenten en schatting | algemene synthese + praktijkgrens | wetenschappelijk instituut | supported |
| Rasverschillen | specifieke begrenzing | multi-cultivaronderzoek | supported |

## Visual teaching contract

| Visual | Teaching question | Vorm | Verplicht zichtbaar | Verboden implicaties | Vereenvoudiging | Labels en HTML-alternatief |
| --- | --- | --- | --- | --- | --- | --- |
| `flower-to-set-outcomes` | Hoe wordt een kleine groene bloem een bes, en hoe verschillen gewone partiële set, coulure en millerandage zichtbaar? | schematisch-naturalistische botanische plaat | gesloten calyptra, kapval, hermaphrodiete bloem, pollenbuisdoorsnede, zwellend ovarium en drie afzonderlijke uitkomsten | insecten als vereiste, ziekte als oorzaak van coulure, losse tros als synoniem voor millerandage, kwaliteitshiërarchie | tijd en schaal worden samengebracht; uitkomsten zijn representatieve modellen | exact 1–7 in pixels; volledige NL/EN-uitleg in HTML |

## Publication gate

- [x] Alle coveragevragen zijn beantwoord of concreet uitbesteed.
- [x] Ownership en entitygrenzen zijn niet dubbel.
- [x] Foundation is zelfstandig begrijpelijk; hogere dieptes verdiepen echt.
- [x] Voorbeelden zijn wereldwijd inhoudelijk gebalanceerd.
- [x] Algemene synthese en specifieke claims hebben passende provenance.
- [x] NL/EN dragen dezelfde kennis, structuur, nuance, links en citations.
- [x] Visuals hebben een leertaak, feitencontract, rechten en toegankelijk alternatief.
- [x] Relations en gerelateerde onderwerpen zijn redactioneel gecontroleerd.
- [x] Pipeline-, link-, repository- en relevante browsertests slagen.

## Iteratielog

- Iteratie 1 — systeemgrens bevestigd; coulure behouden en millerandage toegevoegd als gerichte satellites; troscompactheid en opbrengstschatting blijven hub-owned.
- Iteratie 2 — de hub in acht coverageblokken opgebouwd, met essentiële bloembiologie op foundation en meet- en diagnosegrenzen op hogere diepte.
- Iteratie 3 — coulure en millerandage als compacte, niet-overlappende satellites uitgewerkt; beide hergebruiken dezelfde vergelijkende procesplaat met eigen gelokaliseerde uitleg.
- Iteratie 4 — NL/EN-spiegel, relaties, bronnen, beeldrecord en alle repositorychecks gevalideerd; de volgende owner is `EXP-007` voor besontwikkeling en rijpheid.

## Productieresultaat

- Canonical hub: `concept.flowering-fruit-set-yield`.
- Gerichte satellites: `concept.coulure` en `concept.millerandage`.
- Educatieve plaat: `media.concept.flowering-fruit-set-yield.flower-to-set-outcomes`, taalneutraal genummerd 1–7 en volledig uitgelegd in gelokaliseerde HTML.
- Uitbesteed: besontwikkeling en rijpheid naar `EXP-007`; gedetailleerde snoei-, loofwand- en crop-loadbeslissingen naar `EXP-012`.
