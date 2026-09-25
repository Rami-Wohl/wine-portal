# Contentbrief — Besontwikkeling, véraison en rijpheid

Datum: 2026-09-25  
Roadmapticket: `EXP-007`  
Voorgesteld package: `concept.berry-development-ripeness`  
Archetype: `concept-system-overview`

## Voorkennis, paginabelofte en ownership

- Veronderstelde voorkennis: de lezer kan vruchtzetting en véraison in de jaarcyclus plaatsen en kent de wijnstok als systeem van sources en sinks.
- Na afloop kan de lezer de hoofdperioden van besontwikkeling volgen, de verschillende veranderende weefsels en stoffen uit elkaar houden en uitleggen waarom oogstrijpheid een doelgebonden beslissing is.
- Deze pagina is de canonical eigenaar van besontwikkeling vanaf vruchtzetting tot oogst en van het meer-dimensionale rijpheids- en oogstbesluit.
- De pagina bezit bewust niet de volledige wijnchemie van zuur of tannine, laat-oogstmethoden, waterstressfysiologie of latere keldertransformaties.
- Parentcontext: `concept.grapevine-phenology`, `concept.vine-as-living-system` en `concept.flowering-fruit-set-yield`.

## Entitybesluit

- [x] De satellite-toets is toegepast.
- Véraison blijft een hub-owned procesfase: de definitie, fysiologie en meetproblemen worden hier volledig genoeg behandeld en hebben nu geen aparte onderhoudscyclus nodig.
- Technologische, fenolische en aromatische rijpheid blijven beoordelingslenzen binnen de hub. Losse pagina’s zouden schijnbaar onafhankelijke eindpunten maken en ownership dupliceren.
- `concept.acidity`, `concept.tannin` en `concept.late-harvest` blijven zelfstandige satellites voor hun bestaande bredere scopes.

## Lezersvragen en coverage

| Coverage key | Centrale vraag | Besluit |
| --- | --- | --- |
| identity-and-scope | Waar begint en eindigt besontwikkeling, en wat betekent “rijp”? | on-page |
| system-components-and-relationships | Hoe hangen schil, vruchtvlees, zaden, water, suiker, zuren, fenolen en aroma samen? | on-page + links |
| mechanisms-and-interactions | Hoe volgen groei, lagfase, véraison, verzachting en compositie elkaar op? | on-page |
| conditions-and-variation | Waarom verschillen bessen, trossen, rassen, percelen en seizoenen? | on-page |
| decisions-and-trade-offs | Hoe worden meerdere rijpheidslenzen en oogstrisico’s afgewogen? | on-page |
| global-context-and-examples | Blijft het model bruikbaar voor wit/blauw, koel/warm en meerdere stijlen? | on-page |
| evidence-and-limits | Hoe worden trends representatief bemonsterd en metingen juist geïnterpreteerd? | on-page |
| practical-interpretation | Wat zegt de oogstbes over de mogelijke wijn zonder een uitkomst te garanderen? | on-page + links |

## Kennisdiepte en volledigheidsiteraties

- Foundation bezit de complete route, de essentiële definitie van véraison, hoofdweefsels, suiker/zuurontwikkeling, de grens van Brix en de oogsttrade-off.
- Intermediate verklaart weefselverschillen, aroma/fenolen, ruimtelijke variatie en de drie rijpheidslenzen.
- Advanced begrenst de xyleemstop-versimpeling, maakt oogsten tot een besluit onder onzekerheid en scheidt concentratie van hoeveelheid.
- Iteratie 1: alle roadmaponderdelen aan een coverage-owner gekoppeld; geen aparte véraison- of maturity-entity gemaakt.
- Iteratie 2: zuur-, water- en aromatekst herschreven om simultane of universele ontwikkeling te vermijden.
- Iteratie 3: sampling, tijdreeksen en oogstlogistiek toegevoegd zodat de pagina ook het werkelijke besluit verklaart.
- Iteratie 4: NL/EN-pariteit, links, beelden, wereldwijde balans en publicatiechecks gecontroleerd.

## Wereldwijde voorbeeldmatrix

| As | Gebruik | Grens |
| --- | --- | --- |
| koel / warm | verschillend tempo van suikeropbouw en appelzuurverlies | geen klimaat als ideaal |
| droog / nat | concentratie door waterverlies tegenover gezondheids- en regenrisico | geen directe kwaliteitsclaim |
| wit / blauw | andere visuele signalen en andere nadruk op schilfenolen | kleur is niet de definitie van véraison |
| mousserend / stil / zoet / versterkt | verschillende passende oogstmomenten | geen universele eindbes |
| noord / zuid | hetzelfde proces, andere kalender | geen maandnamen |

Vervangingstest: Bordeaux is nergens nodig om het systeem te verklaren. Alle voorbeelden blijven geldig wanneer regio’s worden verwisseld.

## Claims en bronnenplan

| Claimfamilie | Type | Bronnen |
| --- | --- | --- |
| dubbele groeicurve, lagfase en véraison | synthese + modelgrens | Coombe & McCarthy; AWRI |
| suiker, water en vaatstromen | mechanistische synthese | Dai et al. |
| appelzuur en wijnsteenzuur | mechanistische review | Sweetman et al. |
| fenolen, kleur en aromavoorlopers | brede review | Gouot et al. |
| meerdere rijpheidslenzen | vergelijkende studie, zorgvuldig gegeneraliseerd | Meléndez et al. |
| zaadwaarneming | begrensde cultivarstudie | Fredes et al. |
| sampling en keldermetingen | instituut en university extension | AWRI; Oregon State |

Algemene ontwikkelingskennis gebruikt een beperkte syntheseset. Specifieke mechanistische, meet- en cultivarclaims krijgen een directe citation; de pagina verzamelt geen bron per algemeen bekende zin.

## Visual teaching contract

| Visual | Teaching question | Verplicht zichtbaar | Verboden implicaties | HTML-alternatief |
| --- | --- | --- | --- | --- |
| `berry-development-sequence` | Hoe veranderen groei en hoofdcomponenten rond véraison? | exact zes nummers; groene groei, lagfase, gemengde véraison, rijping; richtingen voor grootte, suiker, zuur en pigment | één schakelmoment, witte druiven die paars moeten worden, perfecte eindbes, exacte universele curves | titel + zes stappen + uitleg van vier banen in NL/EN |
| `ripeness-variables` | Welke informatie weegt mee in een oogstbesluit? | exact zeven nummers voor sap, zuur, schil, zaden, aroma, water/massa en gezondheid/weer; drie ongerangschikte oogstmomenten | één score, alle variabelen tegelijk optimaal, later is beter, directe wijnkwaliteit | titel + zeven waarnemingen + uitleg van drie manden in NL/EN |

Beide platen zijn taalneutrale schematisch-naturalistische rasterillustraties op warme off-white achtergrond. Ze bevatten geen geografisch landschap, proza, letters, exacte waarden of decoratieve wijnromantiek. Alle essentiële informatie blijft in HTML beschikbaar en de afbeeldingen schalen proportioneel op smalle schermen.

## Publication gate

- [x] Alle coveragevragen zijn beantwoord of concreet uitbesteed.
- [x] Véraison en rijpheidslenzen hebben geen dubbel ownership.
- [x] Foundation is zelfstandig compleet; hogere niveaus verdiepen mechanisme en onzekerheid.
- [x] Voorbeelden zijn wereldwijd en niet Bordeaux-centrisch.
- [x] Algemene synthese en specifieke claims hebben passende provenance.
- [x] NL en EN delen structuur, kennis, links, nuance en citations.
- [x] Beide visuals hebben een concrete leertaak, feitencontract, rechtenrecord en gelokaliseerde HTML-uitleg.
- [x] Pipeline-, link-, repository- en browsertests slagen.

## Productieresultaat

- Canonical hub: `concept.berry-development-ripeness`.
- Hergebruikte satellites: `concept.acidity`, `concept.tannin` en `concept.late-harvest`.
- Educatieve platen: `media.concept.berry-development-ripeness.berry-development-sequence` en `media.concept.berry-development-ripeness.ripeness-variables`.
- Uitbesteed: volledige waterstress en irrigatie naar `EXP-009`; keldertransformaties naar de vinificatie- en samenstellingstickets.
