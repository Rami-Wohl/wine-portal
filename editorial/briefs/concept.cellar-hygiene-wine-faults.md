# Contentbrief — Kelderhygiëne en wijnfouten

Datum: 2026-10-08. Roadmapticket: EXP-022.
Package: `concept.cellar-hygiene-wine-faults`. Archetype: concept-system-overview.

## Voorkennis, paginabelofte en ownership

Deze pagina is de canonical eigenaar van het preventie- en diagnosemodel voor
kelderhygiëne en wijnfouten. De lezer verbindt contactoppervlak, wijnconditie,
waarneming, analyse en gerichte actie. Basiskennis van vergisting volstaat.
Oxidatie, SO₂, alcoholische vergisting en MLF behouden hun mechanisme-uitleg;
bottling bezit stabilisatie en verpakking. Flesontwikkeling blijft bij EXP-025.
Geen laboratoriumhandleiding, schoonmaakrecept of wettelijke grenswaarden.

Het nieuwe hubbesluit is al vastgelegd in EXP-022 en de ownershipaudit EXP-016.
Zelfstandige zoekvraag en hergebruik vanuit lessen, bescherming en botteling
rechtvaardigen de entity. Brett, reductie, VA, TCA, hergisting en muizigheid
blijven hier compacte hubsecties: deze ronde vraagt geen zelfstandig diepgaand
satellitepackage met eigen onderhoudslifecycle. Geen extra drafts aangemaakt.

## Outline en claimplan vóór prose

| Coverage / block | Lezersvraag | Evidence | Diepte |
| --- | --- | --- | --- |
| identity-and-scope / overzicht | Wat zijn hygiëne, afwijking en fout? | AWRI faults; UC Davis sanitation | foundation |
| system-components-and-relationships / opbouw-en-samenhang | Hoe werken contactketen en wijnconditie samen? | AWRI cleaning; UC Davis sanitation | foundation; intermediate kwetsbare contactpunten |
| mechanisms-and-interactions / werking | Welke causale routes onderscheiden de foutfamilies? | AWRI faults, Brett, VSC, VA, microbial stability | foundation; intermediate levende cellen versus metabolieten |
| conditions-and-variation / omstandigheden-en-variatie | Welke omstandigheden veranderen groei en waarneming? | AWRI microbiology, SO₂; Wine Australia VSC | foundation; intermediate zwavelverbindingen |
| decisions-and-trade-offs / keuzes-en-afwegingen | Hoe kies je controle en actie zonder blind te behandelen? | AWRI cleaning, VSC, Brett | foundation |
| global-context-and-examples / wereldwijde-context | Welke verschillende keldercontexten tonen hetzelfde model? | UC Davis sanitation; AWRI Brett/mousiness | foundation |
| evidence-and-limits / bewijs-en-grenzen | Wat bewijzen geur, analyse en een schoon oppervlak? | AWRI faults, cleaning, Brett; VSC research | foundation; advanced latente zwavelbronnen |
| practical-interpretation / betekenis-voor-wijn | Hoe gebruik je waarneming als startpunt voor onderzoek? | synthese van voorgaande bronnen | foundation |

Specifieke claims krijgen directe citations: ethylacetaat is een ester en niet
de VA-meting zelf; Brettcellen en hun vluchtige fenolen beantwoorden
verschillende analysevragen; TCA kan buiten de kurk ontstaan; muizigheid kan pas
na proeven duidelijk worden; AWRI-onderzoek toont latente zwavelbronnen na
botteling, zonder een universeel herstelrecept te rechtvaardigen.

## Voorbeeldmatrix en dependencies

| Voorbeeld | Leertaak | Grens |
| --- | --- | --- |
| UC Davis: gedeelde monsterapparatuur | Kruisbesmetting tussen partijen, ook in kleine kelders | Geen claim over Amerikaanse incidentie |
| AWRI: bijvulwijn en vatopslag | Inkomende wijn kan deel van de besmettingsroute zijn | Geen fout exclusief voor rode wijn of Australië |
| AWRI: gewijzigde wittewijnpraktijken | Stijlkeuze verandert benodigde bewaking | Geen algemene uitspraak dat weinig ingrijpen bederf veroorzaakt |

De mechanismen blijven gelijk wanneer land of regio wisselt. Klimaatassen
voegen hier geen verklarende waarde toe; wijnsamenstelling en procescontext wel.
Hergebruik: oxidation, sulfur-dioxide, fermentation, malolactic-fermentation,
bottling, volatile-thiols. Nieuwe links vanuit oxidation en de lesson
maturation-and-protection; bottling krijgt een gerichte verwijzing voor diagnose.
Geen dubbele wederkerige graphrelaties. Lessen behouden hun introductiescope.

## Visual teaching contract

Teaching question: hoe verbinden preventie en diagnose zich zonder een geur
rechtstreeks aan één veroorzaker te koppelen? Vier genummerde vignetten op één
PNG-plaat: (1) afzetting verwijderen uit een losgenomen koppeling, (2) schone
contactketen naar een gesloten tank, (3) afzonderlijke wijnmonsters vergelijken,
(4) monster plus laboratoriumonderzoek. De samenhang wordt in HTML uitgelegd.
Een vergelijkende schematische plaat toont dit model beter dan één foto van
zichtbare apparatuur. Geen bewijsfoto of instructie voor het bedienen van machines.

Warm ivoor, ingetogen olijf/bordeaux, aquarel/gouache. Geen microbiële monsters,
gekleurde geurdampen, een-op-een-geurdiagnose, chemicaliëndosering, tankbetreding
of verzonnen analysegrafiek. Alleen nummers 1–4, geen ingebakken taal. Detail
beperkt tot herkenbare apparatuur; toets 390/1440 px en equivalente NL/EN-legenda.

## Bronreview

Geopend: AWRI faults, cleaning, microbiological stability, Brett factsheet
(februari 2023), removal of volatile sulfur compounds; UC Davis sanitation
(2023); Wine Australia onderzoeksproject AWRI 1701-3.4.2 (2022); AWRI
volatile acidity (2018), mousiness (2015) en oak taints (2023).
Geen percentages voor ontsmetting overgenomen: bronnen hanteren verschillende
operationele reducties. Geen doseringen of wettelijke limieten uit oude
praktijkpublicaties veralgemeniseerd. Latere onderzoeksbevindingen over beluchting
worden beperkt tot de onderzochte zwavelverbindingen en omstandigheden.

## Generatieprompt

Tool: ingebouwde `image_gen.imagegen`; nieuwe PNG zonder referentiebeelden.

```text
Use case: scientific-educational. Create a landscape 3:2 PNG plate for Oenocademy teaching how prevention and investigation work together in winery hygiene. Four spacious equal vignettes in a two by two arrangement on warm ivory paper, refined editorial watercolor and gouache with restrained fine ink, natural stainless steel, muted olive, limestone and small burgundy wine accents. Each vignette has exactly one small clear dark number: 1 upper left, 2 upper right, 3 lower left, 4 lower right. 1: a gloved hand with a small brush removing a modest burgundy wine deposit from a detached stainless steel hose coupling over a clean shallow wash tray; no chemical containers or splashes. 2: a neatly stored wine transfer hose hanging on a wall rack with its ends elevated and capped beside a closed stainless steel wine tank, showing a protected clean contact chain. 3: two identical clear stemmed tasting glasses each holding a small sample of the SAME ruby red wine, next to two separate closed sample bottles with plain blank labels, on a clean tasting bench; the wines look identical because appearance alone cannot diagnose their condition. 4: a simple recognizable laboratory microscope, a closed wine sample vial and a blank notebook on a clean separate laboratory bench, representing additional investigation without displaying a result. No arrows, no smell clouds, no cartoon microbes, no faces, no scary symbols, no stains in glasses, no charts, no country-specific architecture, no words or labels except the four numbers. These are related tasks, not an apparatus operating manual or a one-step diagnostic test. Believable physical materials and proportions, quiet uncluttered composition with generous whitespace, no decorative borders, no vector clipart, no photorealism. Objects must remain recognizable at mobile width.
```

## Eindcontrole

- [x] Outline, eigenaarschap, dependencies, bronnenplan en visualvraag vastgelegd.
- [x] NL/EN volledig en equivalent; specifieke claims gecontroleerd.
- [x] PNG, rechten, altteksten, legenda en responsive gedrag gereviewd.
- [x] Content-, link-, applicatie- en browsertests geslaagd.
- [x] Coverage en productplanning bijgewerkt.

## Uitvoering en verificatie — 2026-10-08

Nieuwe actieve systeemhub in beide talen, met acht coveragevragen, zeven
foutfamilies en vier verdiepende passages. Acht bronrecords toegevoegd; zes
bestaande concepten blijven mechanisme-eigenaar. Bottling, oxidation en de les
maturation-and-protection verwijzen gericht naar de nieuwe hub. Geen nieuwe
satellitedrafts nodig voor deze scope.

De gegenereerde PNG is 1536 × 1024 px en staat onder
`public/media/concepts/cellar-hygiene-wine-faults/prevention-and-investigation.png`.
Visueel gereviewd: vier herkenbare scènes, dezelfde wijnkleur in beide glazen,
geen ingebeelde meetuitslag. De microscoop wordt in de caption expliciet als
algemeen symbool voor aanvullend onderzoek geduid. Alttekst, HTML-legenda en
caption zijn in NL/EN equivalent.

Validatie:

- `npm run format` en `npm run check` geslaagd: lint/typecheck, 148 unittests,
  287 actieve entities met voldoende relationele dekking.
- `content:check` en productiebuild met webpack geslaagd: 354 entities,
  584 bronnen, 183 media-assets en 1306 voorwaartse relaties.
- Volledige browsersuite uitgevoerd: alle 125 bestaande tests geslaagd.
  Twee nieuwe tests verwachtten aanvankelijk de entity-ID als URL; gecorrigeerd
  naar de bestaande canonical route `alcoholic-fermentation`. Daarna alle vier
  nieuwe tests geslaagd: beide talen, diepte, alias/deeplink, leslink, PNG en
  tekstalternatief zonder JavaScript. Geen applicatieregressie aangetroffen.
- Automatisch geen horizontale overflow bij 390, 768 en 1440 px; aanvullend
  handmatig NL/EN op 390 en 1440 px bekeken. Titel, bediening, PNG en legenda
  passen; Engelse diepteknoppen lopen op mobiel leesbaar door naar een tweede
  rij. Taalkeuze gecontroleerd en oorspronkelijke NL/Gevorderd-voorkeur hersteld.
- Linkaudit: 945 reviewkandidaten (176 nieuw, 766 pending, 3 false positives),
  geen lijst met kapotte links. De brede integratiereview blijft bij EXP-026.
  Taalaudit is eveneens een redactionele inventaris, geen automatische foutlijst;
  de nieuwe teksten zijn afzonderlijk op betekenisvolle formuleringen gereviewd.
- Productplanning: EXP-022 afgerond, EXP-023 volgt; 18 openstaande tickets.
  Eerdere dependency- en externe blokkades zijn niet opnieuw vrijgegeven.
