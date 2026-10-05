# Contentbrief — Productieroutes voor stille wijn

Datum: 2026-10-05. Ticket: EXP-019. Archetype: concept-system-overview.

## Paginabelofte en ownership

Deze pagina is de canonical eigenaar van de vergelijking tussen de hoofdwegen
voor wit, rosé, rood en schilvergist wit: welke druivendelen blijven tijdens
vergisting samen en wanneer volgt de scheiding? De lezer kent druif, sap en gist;
begrippen worden bij eerste gebruik uitgelegd. Ontvangst blijft bij
`grape-reception-must-preparation`, suikeromzetting bij `fermentation`, contact
bij `maceration`, overdracht en hoedbeheer bij `extraction`, scheiding en fracties
bij `pressing`. Rijping, afwerking en bijzondere wijnfamilies volgen bij EXP-020–023.

## Outline en claimplan

| Coverage / block | Lezersvraag en claimfamilie | Bronplan | Diepte |
| --- | --- | --- | --- |
| identity-and-scope / overzicht | Wat onderscheidt de vier routes en waar stopt deze vergelijking? | OIV pressing/maceration; AWRI skin contact | foundation |
| system-components-and-relationships / opbouw-en-samenhang | Hoe verbinden ontvangst, vergisting, contact en scheiding zich? | OIV; bestaande owners | foundation |
| mechanisms-and-interactions / werking | Hoe verschillen volgorde en materiaal per route, inclusief direct geperste rosé en saignée? | IFV rosé; AWRI amber/saignée | foundation; intermediate saignée |
| conditions-and-variation / omstandigheden-en-variatie | Hoe veranderen intacte bessen, stelen, ras en fruitconditie het verloop? | AWRI whole bunch; IFV carbonic | foundation; intermediate intact versus tros |
| decisions-and-trade-offs / keuzes-en-afwegingen | Waarop baseert de maker het eindpunt en de intensiteit? | AWRI maceration/temp; OIV pressing | foundation |
| global-context-and-examples / wereldwijde-context | Welke praktijken laten verschillen zien? | IFV rosé; AWRI Chardonnay; Beaujolais regionale praktijk | foundation |
| evidence-and-limits / bewijs-en-grenzen | Hoe onderscheid je route, normdefinitie en gemeten uitkomst? | OIV I.4.9; AWRI trials | foundation; advanced normscope |
| practical-interpretation / betekenis-voor-wijn | Wat legt de route uit over kleur en textuur, en welke latere keuzes blijven over? | AWRI synthese; bestaande owners | foundation |

De goedgekeurde roadmap en EXP-016-ownershipaudit autoriseren deze scope.
Outline/dependencies worden vóór prose vastgelegd; claims blijven open tot de
primaire bron is gelezen. Geen vaste temperatuur, duur, smaak- of kwaliteitsgarantie.

## Dependencies en voorbeeldkeuze

Bestaande owners: ontvangst, fermentation, maceration, extraction, pressing,
carbonic-maceration, tannin, acidity, oxidation, sulfur-dioxide, elevage en
assemblage. Chardonnay en Cabernet Sauvignon kunnen als bestaande druifrecords
worden gelinkt waar ze onderzoekscontext dragen. Geen nieuwe druif- of
regioentities uitsluitend voor een bronvoorbeeld. Orange, saignée, pigeage,
remontage, délestage en hele-trosvergisting blijven binnen hun vastgelegde owners.

Voorbeelden: Franse roséroutes; Australische proeven met witte schilvergisting;
Beaujolais als concrete semi-carbonische praktijk. Landen dienen het contrast,
Bordeaux vormt geen standaard. Systeemvraag blijft gelijk zonder regionale namen.

## Gekoppelde packages

- `carbonic-maceration`: bestaande draft invullen als focused overview, eigen
  brief/plan. Intacte bes, anaerobe omzetting, semi-carbonisch en verdere
  gistvergisting scheiden. Geen nieuw ID of tweede owner.
- `maceration`: gerichte review van contactregimes, rosé, cold soak en verwijzing
  naar routehub/carbonic. Oude blocks behouden; geen volledige herschrijving.
- `extraction`: hoedbeheer verduidelijken, inclusief délestage en het verschil
  tussen mengen, zuurstoftoevoer en extractie; oude anchors/foto behouden.
- `pressing`: relatie met routehub en persen vóór volledige uitgisting expliciet.
- `three-still-wine-routes`: introductiescope behouden; direct persen naast korte
  rosé-inweking en vierde route als variant. Leerdoelen en path behouden.
- `grape-to-must` en `grape-as-raw-material`: controleren op route-tegenspraak;
  alleen wijzigen wanneer de audit een concrete correctie vereist.

## Visual teaching contract

Nieuwe PNG: vier horizontale stroken op warm licht papier, per strook een
nummer, druiven en twee helder herkenbare stadia met een pijl. 1: witte druiven,
pers, gisttank zonder schillen. 2: blauwe druiven, pers met roze sap, gisttank
zonder schillen (directe persing als één roséroute). 3: blauwe druiven,
gistingskuip met schillenhoed, pers. 4: witte druiven, gistingskuip met schillen,
pers. Zo toont één illustratie het omgekeerde scheidingsmoment. Rustige
waterverf/gouache, geloofwaardige materialen; geen labels, wijnglazen, kaarten,
exacte tijden of impliciete kwaliteitsladder. Nummers 1–4 zijn taalneutraal;
een HTML-lijst in beide talen verklaart alle stappen en de rosévariant.

De hub krijgt de nieuwe plaat. De bestaande les-PNG blijft als drieluik bruikbaar
mits caption en tekst haar rosékolom expliciet begrenzen tot korte inweking;
zij vertegenwoordigt niet alle rosé. Bestaande documentaire foto's behouden.
Controleer nieuwe en hergebruikte beelden op 390/1440 pixels en alle essentie
zonder afbeelding. Bestaande SVG-migratie blijft MNT-053.

## Generatieprompt

Tool: ingebouwde `image_gen.imagegen`, nieuwe PNG, geen referentiebeeld of nabewerking.

```text
Use case: scientific-educational. Asset: Oenocademy educational PNG, approximately landscape 3:2. Create a restrained editorial watercolor and gouache plate on warm off-white paper explaining WHEN grapes are pressed relative to fermentation. Four generous horizontal rows, read left to right, numbered 1, 2, 3, 4 at the left. Exactly three physical objects per row and two thin muted aubergine arrows pointing right. Same coherent scale and elegant naturalist rendering, muted green grapes, deep purple black grapes, limestone, warm brown and steel. No decorative cellar background.
Row 1: small cluster of pale green grapes -> recognizable small wooden basket press with pale gold juice dripping into a tray -> cutaway stainless tank containing pale gold bubbling juice with NO grape solids.
Row 2: small cluster of dark purple grapes -> the same basket press with light pink juice in tray -> cutaway stainless tank containing light pink bubbling juice with NO grape solids. This row depicts direct-pressed rosé.
Row 3: small cluster of dark purple grapes -> open cutaway fermentation vat of reddish liquid visibly topped with dark grape skins and small fermentation bubbles -> basket press containing dark grape pomace and releasing red wine.
Row 4: small cluster of pale green grapes -> open cutaway fermentation vat of gold-amber liquid visibly topped with yellow-green grape skins and small fermentation bubbles -> basket press containing pale grape pomace and releasing amber wine.
Numbers 1–4 only, absolutely no words, labels, headings or logos. Keep fermentation-vat and basket-press silhouettes unmistakably different. Emphasize skins present or absent. Clear left-to-right arrows, no cross-row arrows, no glasses/bottles, no orange fruit, no infographic vector clipart. Painterly but precise objects, soft light and abundant spacing, readable when reduced. All four rows equally important. This is a conceptual comparison, not real apparatus instructions.
```

## Publication gate

- [x] Ownership, outline en afhankelijkheden vastgesteld.
- [x] Bronnen geopend en claims herzien.
- [x] NL/EN, oude anchors en verwijzingen gereviewd.
- [x] Diagram inhoudelijk, technisch en responsief gecontroleerd.
- [x] Format, check, content/link/taalcontrole en browsertests geslaagd.
- [x] Roadmaps en eerstvolgende taak bijgewerkt.


## Review en validatie — 2026-10-05

- Tien aanvullende bronrecords: AWRI carbonic (web en 2018), whole bunch,
  amber, saignée en cap management (2023); IFV carbonic en rosé; OIV I.4.9;
  Inter Beaujolais als bron voor regionale praktijk. Bestaande OIV-maceration,
  pressing en cold-soak-definities en AWRI/WRE-mechanismen opnieuw geraadpleegd.
- Directe persing en korte inweking naast elkaar gezet; saignée als keuze voor
  twee partijen uitgelegd. Hele trossen onderscheiden van intacte bessen en
  carbonische omstandigheden. Geen vaste contactduur of kwaliteitsrangorde.
- De maand in OIV I.4.9 is uitsluitend aan die formele categorie gekoppeld;
  geen universele minimumduur voor iedere wijn die orange wordt genoemd.
- `maceration`, `extraction` en `pressing` gericht aangevuld. De introductieles
  behoudt doelen, blocks en de bestaande drie-route-PNG, met een preciezere
  rosécaption. `grape-to-must` en `grape-as-raw-material` gecontroleerd;
  geen extra routecorrecties nodig. Historische research en media behouden.
- Nieuwe PNG: `public/media/concepts/winemaking-routes/four-routes.png`,
  1536×1024. Visueel gecontroleerd op procesvolgorde en schillenaanwezigheid.
  De schematische massa stelt druivendelen voor; vaten zijn geen bouwtekening.
  Bij 390×844 en 1440×1000 blijven nummers, volgorde en HTML-uitleg bruikbaar;
  afbeelding laadt, geen horizontale pagina-overloop.
- NL/EN hebben gelijke blockmetadata en entitytargets. Alle bestaande anchors
  van de satellites zijn behouden; nieuwe bronnen staan zowel lokaal als op
  packageniveau geregistreerd. Les en hub verwijzen wederzijds, met leerpadcontext.
- `npm run format`, `npm run check` (133 tests), productiebuild met webpack
  en `npx playwright test` (85 tests) geslaagd. Content- en relatievalidatie
  geslaagd: 353 entities, 286 actief, 67 draft, 569 sources, 181 media,
  1.296 forward relations. `git diff --check` schoon.
- Link- en taalaudits uitgevoerd. Hun brede suggestielijsten zijn inventarissen,
  geen validatiefouten of automatische opdracht alle termvermeldingen te linken.
  Verdere graph-/terminologie-integratie blijft bij EXP-026.
- Browser: beide PNG's op mobiel/desktop, basis versus gevorderd, bestaande
  Nederlandse carbonic-URLredirect en lesson → hub → lesson-verwijzing bevestigd.
  De publieke UI blijft Nederlands; Engelse authoring is gecontroleerd en de
  publieke taalpresentatie volgt in MNT-046.
- EXP-019 afgerond in de roadmaps. Eerstvolgende globale taak: MNT-049 (CSS),
  daarna MNT-046 (taalpresentatie) en MNT-048 (pipeline/model). De volgende
  inhoudelijke taak is EXP-020. Geen commit of deployment uitgevoerd.
