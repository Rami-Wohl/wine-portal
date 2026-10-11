# Contentbrief — Wijnsamenstelling

Datum: 2026-10-11  
Roadmapticket: `EXP-024`  
Package: `concept.wine-composition`  
Archetype: `concept-system-overview`

## Voorkennis, paginabelofte en ownership

Voorkennis: druif, most en wijn; vergisting wordt kort uitgelegd.
Deze pagina is de canonical eigenaar van de samenhang tussen de stoffamilies in
wijn, hun oorsprong, onderlinge interacties en de betekenis van meetgegevens.
De lezer kan een technische fiche verbinden met druif en kelder zonder iedere
stof aan één aroma of kwaliteitsscore gelijk te stellen.

Acidity en tannin houden hun volledige chemische/sensorische uitleg;
methoxypyrazines en volatile-thiols hun specifieke aromaketen. Fermentation,
extraction, lees-ageing, oxidation, sulfur-dioxide en bottling houden de
procesdetails. Zoete, mousserende en versterkte wijnen behouden hun eigen
familiescope. Waarneming, balans, drempels en flesontwikkeling volgen in EXP-025.

Entitytoets: zelfstandige zoekvraag, hergebruik door lessen en concepts, eigen
systeemvraag en meerdere relaties. Geen bestaande owner beantwoordt die vraag.
Water, ethanol, glycerol, eiwitten, polysachariden, mineralen en afzonderlijke
gassen blijven hier compact uitgelegd; voor deze taak zijn geen extra entities
nodig. Geen nieuwe modelvelden of renderercomponenten.

## Outline vóór proza en bewijsplan

| Coverage / block | Lezersvraag | Bronnenbasis | Diepte |
| --- | --- | --- | --- |
| identity-and-scope / overzicht | Wat betekent samenstelling en waar komt zij vandaan? | WSET composition; OIV fermentation | foundation |
| system-components-and-relationships / opbouw-en-samenhang | Welke tien stoffamilies plus glycerol zijn relevant, en wat doen ze? | WSET; UC Davis minerals/tannin/anthocyanins/glycerol; polysaccharide review; AWRI heat/gas | foundation |
| mechanisms-and-interactions / werking | Hoe veranderen vergisting, extractie en rijping het mengsel? | OIV; UC Davis thiols/pyrazines; AWRI lees, MLF, SO₂, acidity | foundation; intermediate vrij-en-gebonden |
| conditions-and-variation / omstandigheden-en-variatie | Welke samenstelling en omstandigheden veranderen gas, stabiliteit en textuur? | AWRI gas/heat/cold; polysaccharide review | foundation |
| decisions-and-trade-offs / keuzes-en-afwegingen | Wat sturen oogst, extractie, gisting en bottelvoorbereiding samen? | AWRI fermentation-temperature, lees, heat; bestaande owners | foundation |
| global-context-and-examples / wereldwijde-context | Wat leren contrasterende wijnen en onderzoeksmonsters? | UC Davis thiols; AWRI composition survey, lees trial; bestaande familieowners | foundation |
| evidence-and-limits / bewijs-en-grenzen | Wat meten alcohol, restsuiker, pH, TA en stabiliteit elk? | AWRI acidity, residual sugar, TSS, heat/cold; UC Davis glycerol | foundation; advanced wat-een-meetmethode-telt |
| practical-interpretation / betekenis-voor-wijn | Hoe verbind je samenstelling, proces en proefwaarneming? | AWRI flavour precursors; voorgaande analysebronnen | foundation |

Specifieke claims krijgen directe citations: gist vormt ethanol/CO₂ en glycerol;
polysachariden komen uit druif en gist; pH en TA verschillen; vrije/gebonden SO₂;
KHT en eiwithaze; glucose/fructose versus reducerende suikers; Brix meetprincipe;
onderzoekspopulatie van de Australische compositiesurvey en Chardonnayproef.
Geen universele percentages, molecuuldrempels, recepten, wettelijke grenzen,
voedings-/gezondheidsadvies of regionale smaakgaranties.

## Voorbeeldmatrix

- Sauvignon Blanc, waaronder Nieuw-Zeeland: druivenvoorlopers en vluchtige
  thiolen; de stof komt ook bij andere rassen voor. UC Davis onderbouwt de scope.
- Zoete, mousserende en versterkte families: suiker, gas en alcoholtoevoeging
  blijven afzonderlijke vragen, met directe links naar bestaande familieowners.
- Australische rode/witte wijnen in AWRI-onderzoek: een onderzoeksverdeling is
  geen universele compositienorm. Bij de 2019-Chardonnayproef trad ook MLF op;
  textuur kan daarom niet alleen aan liescontact worden toegeschreven.

Vervangingstest: het systeemmodel blijft gelden bij andere druiven en regio's;
voorbeelden laten verschillende ketens zien en leveren geen land- of kwaliteitsrangorde.

## Dependencies

Bestaande owners: berry-development-ripeness, fermentation, extraction, acidity,
tannin, methoxypyrazines, volatile-thiols, malolactic-fermentation, lees-ageing,
oxidation, sulfur-dioxide, bottling, sweet-wines, sparkling-wines, fortified-wines.
De grondstofles is consumer van de nieuwe owner. Geen nieuwe draftdependencies.

## Bronnenreview

Op 2026-10-11 geopend: WSET What is wine; OIV alcoholic fermentation; AWRI
acidity/pH, residual sugar, TSS, heat stability, cold stabilisation, gas
adjustment, SO₂, fermentation temperature, MLF-factsheet en leescontact-review.
Aanvullend: Martínez-Lapuente, Guadalupe & Ayestarán (2019), Properties of Wine
Polysaccharides, open peer-reviewed chapter, §§1–3; AWRI project 3.1.3 en Wilkes
(2021), Impact of wine components on energy label calculations; Waterhouse Lab
UC Davis over glycerol, minerals, tannin, anthocyanins, volatile thiols en pyrazines.
De oude studentbijdragen worden alleen voor beperkte stabiele chemische context
gebruikt, naast instituts- en reviewliteratuur; geen actuele normclaims.

Niet als nieuwe bewijsbasis gebruikt: onbereikbare DOI's voor Coetzee/Zhao,
timeout bij de tannine-PDF en 404 bij een oude AWRI-attachment van Wilkes.
De bereikbare Wilkes-HTML is gelezen; bestaande provenance blijft ongewijzigd.
Een UC Davis-pagina met de titel Sources of Phenolic Compounds bleek een
leverancierslijst en is uitgesloten; de inhoudelijke tannine- en anthocyaninepagina’s
dragen de chemische indeling.

## Visual teaching contract en definitieve prompt

Teaching question: hoe veranderen druifbestanddelen via vergisting en verdere
kelderbehandeling in de samenstelling van wijn? Een gewone foto kan die
onzichtbare omzettingen niet tonen. Eén schematisch-naturalistische PNG met drie
genummerde scènes: druif/sap, vergistende most met gasafvoer, wijn boven lies.
De genummerde HTML-uitleg draagt alle chemische betekenis. Geen molecuulplaatjes,
percentagetaart, gescheiden lagen water/alcohol of zichtbare aromastoffen.
Liescontact is één mogelijke rijpingsroute. Het beeld toont geen recept of
verplichte volgorde voor alle wijnen. 1536×1024; controle op 390/768/1440 px.

```text
Use case: scientific-educational
Asset type: Oenocademy educational PNG plate, landscape 1536×1024.
Primary request: explain three moments in the changing composition of wine with
three calm numbered naturalist vignettes. 1 on the left: a freshly cut ripe
purple grape berry, several intact berries and a shallow clear dish of pale
fresh grape juice; believable skin, translucent pulp and seeds. 2 in the centre:
a clear glass fermentation vessel containing homogeneous cloudy pink-purple
grape must, a practical fermentation airlock on top through which a few small
gas bubbles escape. 3 on the right: a separate clear glass vessel containing
homogeneous clear ruby wine above a thin beige sediment of settled yeast lees,
beside a simple small glass of the same ruby wine. The liquid is uniform in
colour, never layers of water and alcohol. No pouring or ingredient additions.
Style/medium: refined editorial watercolour and gouache, delicate restrained
ink, believable materials, warm ivory paper, muted burgundy, olive and straw.
Composition: three spacious separate vignettes across one landscape plate;
exactly the small burgundy numerals "1", "2", "3" above their respective scenes.
Objects large and clear enough to recognise at 330 px display width. A gentle
reading order, no connecting arrows. No scenery or geography.
Constraints: no other text, no labels, no molecule icons, no pie charts or
percentages, no fruit aroma objects floating in wine, no sugar cubes, no bubbles
in the finished still wine, no scales, no laboratory precision, no logos,
watermarks, vector look, decorative frames or bright gradients. This is a
conceptual comparison of origins and transformations, not a universal recipe.
```

## Publicatiecontrole

- [x] Scope, ownership, acht coveragevragen, dependencies en bronplan vóór proza gereviewd.
- [x] Sectievragen volledig beantwoord; foundation zelfstandig begrijpelijk.
- [x] NL/EN-structuur, claims, links en brongebruik gelijkwaardig.
- [x] PNG didactisch, visueel en responsive gecontroleerd.
- [x] Relations, consumerlink, pipeline, linkaudit en repositorychecks geslaagd.
- [x] Relevante productie-E2E geslaagd; planning en reviewregister bijgewerkt.

## Publicatiereview — 2026-10-11

Review-ID: `QCR-2026-10-11-01`. Scope: EXP-024, de gewijzigde consumerlinks,
de nieuwe PNG en de tijdens visuele controle gevonden tabelomloop (`MNT-058`).

De acht sectievragen zijn in beide talen beantwoord. Foundation geeft zelfstandig
het mengselmodel; intermediate behandelt vrije/gebonden vormen en advanced
meetprincipes. De 13 blockdirectives, 25 entitylinks en 30 citations staan in
dezelfde volgorde in NL en EN. De grondstofles en zes bestaande concepts
verwijzen naar de nieuwe owner; bestaande procesdiepte en anchors blijven werken.
De tien `related_to`-relaties zijn eenmaal opgeslagen en de afgeleide groep is
inhoudelijk beoordeeld. Er zijn geen nieuwe draftdependencies.

De negen nieuwe bronrecords vullen bestaande evidence aan. De Chardonnayclaim
is in de eindcontrole expliciet begrensd: de proef combineerde liescontact met
onbedoelde MLF, zodat het waargenomen textuureffect niet aan één factor mag worden
toegeschreven. Bronbasis en claims zijn in beide talen gereviewd.

De PNG is visueel geïnspecteerd op bronformaat en in het artikel: 1536×1024,
2.716.537 bytes; SHA-256 stemt overeen met het mediarecord. Druif/sap, vergistende
most en wijn boven lies zijn herkenbaar. Nummers verwijzen naar de gelokaliseerde
HTML-lijst; de tekst begrenst liescontact als één mogelijke route. Geen zichtbare
stoflagen, molecuulformules, geografische claims of vast smaakresultaat.

NL/EN zijn visueel gecontroleerd op 390, 768 en 1440 px, met aandacht voor koppen,
illustratie, tabelinhoud en kennisdiepte. De mobiele taalwissel behoudt pagina en
sectieanker. De tabelwrapper gebruikte nog `text-wrap: nowrap`; daardoor vereisten
de nieuwe teksttabellen zelfs op desktop horizontaal scrollen. `MNT-058` laat
tekst afbreken. Beide tabellen passen nu op tablet en desktop binnen de
artikelkolom; op mobiel blijft de focusbare horizontale scrollregio behouden.
Ook de bestaande botteling- en versterkingstabellen zijn visueel gecontroleerd;
de volledige browserregressie dekt de bestaande routes en consumenten.

Validatie na de laatste inhouds- en CSS-wijziging:

- `npm run content:check`: geldig; 358 entities (294 actief, 64 draft),
  8 narratives, 1 learning path, 606 sources en 187 mediarecords.
- `npm run format` en `npm run check`: geslaagd; 148 unit-tests,
  typecheck, lint en relation-audit voor alle 294 actieve entities.
- `npm run test:e2e`: productiebuild met Webpack en alle 153 browsertests
  geslaagd, waaronder acht nieuwe EXP-024-cases. Die controleren NL/EN,
  dieptelagen, links, zoekresultaten, sitemap, alias, geen JavaScript,
  paginabreedte en tabelomloop. Mobiel toetsenbordscrollen is afgedekt.
- `npm run content:link-audit -- --all`: uitgevoerd; 998 suggesties (229 nieuw,
  766 pending, 3 false-positive). Dit zijn redactionele linksuggesties, geen
  gebroken links. De zeven
  suggesties op de nieuwe owner zijn redactioneel beoordeeld: persen/mengen
  blijven hier compacte context; Chardonnay en Sauvignon zijn voorbeelden,
  geen extra stofowners. De bredere registerreview blijft bij EXP-026.
- `git diff --check`: geslaagd.

De gewone Turbopack-build kon in deze toolomgeving geen interne procespoort
openen (`Operation not permitted`), ook niet bij herhaling met ruimere
toolrechten. De Webpack-productiebuild en de daarop draaiende volledige suite
slagen. Dit is geen aanwijzing voor een inhouds- of applicatiefout; de normale
Turbopack-build is in deze ronde niet bevestigd.

EXP-024 en MNT-058 zijn afgerond. De bijgewerkte productplanning telt 17 open,
geplande of geblokkeerde tickets. EXP-025 volgt: smaak, aroma, trigeminale
waarneming, textuur, interacties, balans en flesontwikkeling. Drempels blijven
contextafhankelijk; analyse, waarneming en kwaliteitsoordeel moeten onderscheiden
blijven en bestaande oxidatie-/rijpingsowners behouden hun mechanisme-uitleg.
