# Contentbrief — Koolzuurmaceratie

Datum: 2026-10-05. Ticket: EXP-019. Archetype: concept-focused-overview.

Deze pagina is de canonical eigenaar van koolzuurmaceratie en de vergelijking
met semi-carbonische verwerking. Zij behoudt het bestaande draft-ID en de slugs.
Zelfstandigheid volgt uit de eigen zoekvraag, het specifieke intracellulaire
mechanisme en hergebruik door maceration en de routehub. Hele-trosvergisting
als materiaalkeuze blijft in de routehub; gistvergisting blijft bij fermentation.

## Outline

| Coverage / block | Vraag en claimplan | Diepte en bronplan |
| --- | --- | --- |
| identity-and-scope / overzicht | Wat betekent intacte bes in een zuurstofarme atmosfeer? | foundation, OIV/AWRI |
| mechanism-and-function / werking | Wat gebeurt in de bes, en hoe eindigt de wijn zijn gisting? | foundation, AWRI/IFV; intermediate zuurverandering versus MLF |
| conditions-and-variation / omstandigheden-en-variatie | Waar komt CO₂ vandaan bij semi-carbonisch en wat doet vrij sap? | foundation, IFV/Beaujolais/AWRI |
| application-and-decisions / toepassing-en-keuzes | Hoe stuurt men fruitintegriteit, atmosfeer, temperatuur en persen? | foundation, IFV/AWRI |
| evidence-and-limits / bewijs-en-grenzen | Welke variabelen overlappen in een proef en wat zegt één monster? | foundation; advanced IFV-proefopzet en meetgrenzen |
| practical-interpretation / betekenis-voor-wijn | Hoe draagt de techniek bij aan stijl en verdere keuzes? | foundation, AWRI/IFV/regionale praktijk |

Geen universeel alcoholplafond, temperatuurrecept, duur of banaanaroma. Geen
historische uitvindersclaim. Regionale praktijk is geen universele regel of
ongelezen appellationwet. Dependencies: maceration, fermentation, pressing,
winemaking-routes, malolactic-fermentation, acidity, extraction.

## Visual teaching contract

Tweeluik als conceptuele opengewerkte kuipen. 1: CO₂ van buiten ondersteunt een
atmosfeer rond intacte donkere bessen, nauwelijks vrij sap. 2: intacte bessen
boven vrij gistend sap onderin; belletjes/pijl omhoog tonen gas uit gistvergisting.
Geen kleurloos gas letterlijk als vloeistof tekenen, geen gesloten drukbom of
bouwinstructie. Alleen nummers 1–2 en CO₂ indien nodig; HTML legt alles uit.
De plaat vergelijkt beginprincipes, geen exact kelderrecept. Rustige PNG,
waterverf/gouache op licht papier. Schaal van gasbellen conceptueel.

Scope geautoriseerd via EXP-019; outline gereviewd vóór prose. Publicatie volgt
pas na bronreview, gelijke NL/EN-dekking, mediacontrole en repositorychecks.

## Generatieprompt

Tool: ingebouwde `image_gen.imagegen`, nieuwe PNG, geen referentiebeeld of nabewerking.

```text
Use case: scientific-educational. Asset: Oenocademy conceptual PNG illustration. A restrained naturalist watercolor/gouache comparison on warm ivory paper, landscape 3:2, two large simple cutaway stainless winery vessels side by side, numbered 1 and 2 in aubergine above. Soft light, believable dark purple grape berries and brown bunch stems, muted steel and burgundy. Make the scientific contrast legible with few details.
LEFT number 1: closed atmospheric winery tank with a tiny safe vent on top, front removed as a conceptual cutaway. Loose intact grape bunches fill lower two thirds with clear airy gaps between bunches, almost no free liquid at bottom. A small external grey gas cylinder at far left has a hose entering the top of this tank and a modest arrow along hose pointing INTO tank. Cylinder carries only 'CO₂'. No liquid being sprayed, no visible coloured gas filling the spaces, no gauge readings.
RIGHT number 2: same tank, closed with tiny vent, conceptual open front, intact bunches in upper part, lower third a clearly visible pool of dark red juice with small fermentation bubbles; several subtle upward arrows rise from this juice into the air spaces around the upper bunches to express CO₂ released by yeast fermentation below. A few crushed berries at base; intact clusters above the liquid remain clearly distinguishable. No external gas cylinder attached to right tank.
The teaching question is the origin of the CO₂ atmosphere and coexistence of intact fruit with yeast-fermenting juice. These are two simplified starting situations, not steps in a sequence. NO arrow between vessels, NO connecting hose between them, NO 'before/after', no molecular inset, no text other than 1,2,CO₂. Both tanks plausible atmospheric winery vessels, not pressure reactors; no procedural instructions. Spacious composition, no background scenery, no logos. Painterly precise material texture, no flat SVG style.
```


## Publicatie en review — 2026-10-05

- Bestaand ID en beide slugs behouden; lege draft gevuld en geactiveerd na
  inhoudelijke NL/EN-review. AWRI (web/2018), IFV, whole-bunch-uitleg en Inter
  Beaujolais onderbouwen het intracellulaire mechanisme en de praktijkvariatie.
- Intracellulaire appelzuuromzetting onderscheiden van bacteriële MLF.
  Gistactiviteit in vrij sap kan naast intacte bessen bestaan en voltooit de
  suikeromzetting. Eén sapmonster vertegenwoordigt nog intacte bessen niet.
- IFV VINAROMAS-proef kritisch begrensd: onder meer de gistingstemperatuur na
  persen verschilde, waardoor de proef geen geïsoleerd effect van uitsluitend
  intracellulaire omzetting bewijst.
- De oorspronkelijke OIV-carbonic-bron bleef in de metadata behouden. Opnieuw
  openen leverde tijdens deze review fetchfouten op; de nieuwe prose steunt op
  daadwerkelijk gelezen AWRI/IFV-bronnen, niet op een verzonnen OIV-hercontrole.
- Nieuwe PNG: `public/media/concepts/carbonic-maceration/two-starts.png`,
  1536×1024. Tweeluik vergeleken met het teaching contract: extern gas links,
  gistend sap en opstijgend gas rechts; geen volgordepijl tussen de kuipen.
  Visueel gecontroleerd op desktop en mobiel, met volledige HTML-uitleg.
- Alle zes coveragevragen en NL/EN-reviewstaten compleet. Gelijke metadata,
  links en bronverwijzingen gecontroleerd. Oude URLredirect en cumulatieve
  kennisdiepte werken. Repository- en browserverificatie staat in de
  [routebrief](concept.winemaking-routes.md#review-en-validatie--2026-10-05).
