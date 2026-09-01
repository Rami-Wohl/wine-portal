# Design system status

Status: actieve implementatienotities voor de huidige UI.

## Productkarakter

Oenocademy voelt rustig, aandachtig en betrouwbaar, zonder een wijnwinkel,
luxelabel of examenportaal te imiteren. De interface geeft lange inhoud ruimte en
maakt extra kennisdiepte optioneel zonder die informatie in een aparte feitenlaag
te veranderen.

## Geïmplementeerde lagen

1. **Fundamenten** — semantische kleur-, typografie-, spacing-, radius- en
   shadowtokens staan in `src/app/globals.css`.
2. **Primitieven** — links, knoppen, cards, labels, callouts en navigatie gebruiken
   gedeelde componenten en semantische classes.
3. **Contentpatronen** — summaries, sections, kernideeën, caveats, figures,
   citations, bronnen en kennisdiepte worden uit canonical content blocks
   gerenderd.
4. **Paginasamenstellingen** — Explore, Verdiepingen, Learn, Atlas en entitypagina's
   gebruiken dezelfde visuele taal. Entity- en narrative-routing is actief;
   learning paths en Atlasdata zijn nog roadmap.

## Responsive en toegankelijkheidsbasis

- Een smalle leesmaat en mobiele contentvolgorde zijn het uitgangspunt.
- Meerkoloms layout verschijnt alleen wanneer daar voldoende ruimte voor is.
- Betekenis of bediening vereist nooit hover.
- Kernlayouts worden beoordeeld rond 375, 768, 1024 en 1440 CSS-pixels.
- Typografie en spacing schalen binnen bewuste minima en maxima.
- Semantische landmarks, logische headings, zichtbare focus en een skiplink zijn
  de basis.
- Kleur is nooit de enige informatiedrager; reduced motion wordt gerespecteerd.
- De depthselector onthult cumulatief meer inhoud, reageert op anchors en laat
  zonder JavaScript het volledige document beschikbaar.

## Contentcontract voor lessen

Een actieve canonical narrative van type `lesson` volgt het uitvoerbare contract
uit `content-blocks.md`: een summary, leerdoelen, ten minste één section, één
kernidee en één zorgvuldig begrensde koppeling naar het glas. Titel, depth,
bronnen, stable block-IDs en eventuele caveats komen uit het contentmodel.

Er bestaat geen `wine relevance score` in schema of interface. Nieuwe metadata
wordt pas toegevoegd wanneer echte content een herhaalde, geteste use-case toont.

## Volgende UI-stappen

1. Bouw pas learning-pathnavigatie en previous/next-logica nadat het pathschema en
   een eerste echte reeks lessen zijn ontworpen.
2. Voeg persisted progress pas toe nadat anoniem lezen en navigeren inhoudelijk
   werken.
3. Blijf keyboard, screenreader, zoom, mobiele en lange-content-edge-cases testen
   bij relevante wijzigingen.
4. Voeg screenshotregressie toe wanneer de visuele basis stabiel genoeg is om de
   onderhoudslast te rechtvaardigen.
5. Laat nieuwe Bordeaux-content de volgende concrete patronen en componenten
   afdwingen, in plaats van hypothetische UI vooraf te ontwerpen.
