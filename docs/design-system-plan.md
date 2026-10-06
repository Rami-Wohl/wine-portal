# Design system status

Status: actieve implementatienotities voor de huidige UI.

## Productkarakter

Oenocademy voelt rustig, aandachtig en betrouwbaar, zonder een wijnwinkel,
luxelabel of examenportaal te imiteren. De interface geeft lange inhoud ruimte en
maakt extra kennisdiepte optioneel zonder die informatie in een aparte feitenlaag
te veranderen.

## Geïmplementeerde lagen

1. **Fundamenten** — semantische kleur-, typografie-, spacing-, radius- en
   shadowtokens staan in `src/styles/tokens.css`.
2. **Primitieven** — links, knoppen, cards, labels, callouts en navigatie gebruiken
   gedeelde componenten en semantische classes.
3. **Contentpatronen** — summaries, sections, kernideeën, caveats, figures,
   citations, bronnen en kennisdiepte worden uit canonical content blocks
   gerenderd.
4. **Paginasamenstellingen** — Explore, Verdiepingen, Learn, Atlas en entitypagina's
   gebruiken dezelfde visuele taal. Entity- en narrative-routing is actief;
   learning paths, lesnavigatie en lokale voortgang zijn actief. Atlasdata is
   nog roadmap.

## Stylesheetindeling en cascade

`src/app/layout.tsx` importeert uitsluitend `src/app/globals.css`. Dat bestand
is de geordende ingang voor Tailwind en de onderstaande gewone stylesheets.
Er zijn geen routeafhankelijke CSS-imports: dezelfde stijlen gelden ook na
clientnavigatie. De bestanden houden de bestaande semantische classnamen aan.

| Bestand onder `src/styles/` | Verantwoordelijkheid |
| --- | --- |
| `tokens.css` | Gedeelde kleuren, typografie, afmetingen, spacing en motionwaarden |
| `base.css` | Documentbasis, media, focus en skiplink |
| `site-shell.css` | Header, mobiel menu, paginaschil, footer en gedeelde labels |
| `page-intros.css` | Homehero, moduskeuze en gedeelde paginakoppen |
| `discovery.css` | Explore, zoeken, filters, paginatie, entitylinks en lege toestanden |
| `learning-paths.css` | Learn-catalogus, leerpad, voortgang, afronding en gedeelde acties |
| `atlas.css` | Atlasschil en huidige lege geografische toestand |
| `article-layouts.css` | About, breadcrumbs, entitykoppen, dieptebediening, relaties en bronnen |
| `lessons.css` | Lescontext, voltooiing, vorige/volgende en gedeelde Learn-hoverstaten |
| `content.css` | Contentblocks, dieptezichtbaarheid, tabellen, figuren en citations |
| `responsive.css` | Bestaande overrides over componentgrenzen, per breakpoint |
| `reduced-motion.css` | Laatste overrides voor verminderde beweging |

De tabel volgt de importvolgorde. Behoud die volgorde: framework → tokens →
basis → UI-patronen → responsive overrides → reduced motion. De refactor van
`MNT-049` verplaatste regels zonder selectors, declaraties of hun volgorde te
veranderen. Ook gedeelde selectorlijsten blijven bij elkaar: paginakoppen staan
bijvoorbeeld bij `page-intros`, en Learn-hoverstaten volgen de lesdefaults.

Voeg standaardstijlen toe bij het passende patroon; zet wijzigingen aan de
bestaande gedeelde breakpoints in `responsive.css`. De lokale gallery-breakpoint
en de `scripting`-queries blijven bij hun contentregels. Introduceer geen nieuwe
`@layer`, hernoeming of import vanuit een losse route als onbedoeld onderdeel
van een bestandsverplaatsing. Een latere gerichte overgang naar CSS Modules
vraagt een eigen controle van specificiteit, cascade en clientnavigatie.

Controleer de productiebuild: de geïnstalleerde Next.js-gids
`node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` waarschuwt dat
CSS-volgorde tussen ontwikkeling en productie kan verschillen. Vergelijk bij
een zuivere verplaatsing de volledige gecompileerde CSS, inclusief mediaqueries
en keyframes. Er is momenteel geen afzonderlijke printstylesheet; print gebruikt
dezelfde basisregels en toepasselijke mediaqueries.

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

## Vervolg en onderhoud

De Learn-pilot heeft pathnavigatie, previous/next-links en anonieme lokale
voortgang. Evaluatie en eventuele uitbreiding volgen `LRN-012` in
[de Learn-roadmap](learn-roadmap.md). De
[productplanning](product-roadmap.md) zet taalkeuze en Atlas op de juiste plek.

Blijf keyboard, screenreader, zoom, mobiele en lange-content-edge-cases testen
bij relevante wijzigingen. Nieuwe concrete content- en productbehoeften bepalen
welke componenten nodig zijn. De stylesheet is langs bestaande UI-grenzen
opgedeeld (`MNT-049`); houd bovenstaande verantwoordelijkheden en importvolgorde herkenbaar.
Voeg screenshotregressie toe wanneer de winst de onderhoudslast rechtvaardigt.
