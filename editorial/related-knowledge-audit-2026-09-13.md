# Audit gerelateerde onderwerpen — 2026-09-13

Review-ID: `QCR-2026-09-13-01`

## Reikwijdte en methode

Deze review omvat alle 81 actieve entities en de volledige, afgeleide
relatiegrafiek op 13 september 2026. Gecontroleerd zijn:

- alle canonieke forward relaties plus hun inverse weergave;
- duplicaatvalidatie in de bestaande contentpipeline;
- minimale structurele dekking per entitytype;
- de grootste zichtbare relatielijsten en hun scanbaarheid op de entitypagina;
- de aansluiting tussen relaties en gevalideerde dependency-disposities in
  contentplannen.

De nieuwe opdracht `npm run content:relation-audit` maakt de structurele controle
herhaalbaar. Zij controleert geen encyclopedische waarheid: een graaf kan niet
zelf afleiden welke inhoudelijke relatie een auteur nog niet heeft gemodelleerd.
Semantische volledigheid blijft daarom onderdeel van de contentbrief en menselijke
publicatiereview.

## Samenvatting

Alle 81 actieve entities voldoen aan de vastgelegde structurele ondergrens. Er is
geen actieve entity zonder forward of inverse relatie; appellations hebben een
bovenliggende geografie, producenten een productieplaats, classificaties een
scope en actieve druiven worden als belangrijke druif gebruikt. De renderer laat
alle 909 canonieke forward relaties en hun relevante inverse afleidingen zien.

Het probleem zat vooral in presentatie, niet in verloren data. De grootste
panelen liepen uiteen van 58 relaties voor Bordeaux tot 96 voor Saint-Émilion
Grand Cru en 97 voor de classificatie van Saint-Émilion. Eén lange, vlakke reeks
kaarten maakte de inhoud moeilijk te overzien.

## Bevindingen

### 1. De volledige graaf werd getoond, maar onvoldoende gecomprimeerd

De oude groepen waren inhoudelijk correct, maar stonden allemaal tegelijk open.
Dat werkte bij enkele relaties en schaalde slecht bij tientallen producenten of
classificatiedeelnemers.

### 2. Vijf stabiele informatietaken dekken de huidige relatievocabulaire

De bestaande relaties laten zich zonder verlies groeperen als:

1. Plaats & indeling;
2. Druiven & productie;
3. Producenten;
4. Classificatie & rang;
5. Vergelijken & verbinden.

Binnen ieder cluster blijven de preciezere labels, zoals “Onderdeel van”, “Hier
gevestigd” en “Geclassificeerd onder”, behouden. De clustering vervangt dus geen
semantiek; zij voegt een compacte navigatielaag toe.

### 3. Automatische en redactionele volledigheid moeten gescheiden blijven

De pipeline bewaakt reeds dubbele zichtbare targets, ontbrekende targets,
spiegelrelaties en contentplandisposities. De nieuwe audit voegt typegebonden
minimumdekking toe. Een inhoudelijke vraag als “welke naburige appellation hoort
hier nog bij?” vereist nog altijd onderzoek en expliciete redactionele afweging.

### 4. De bestaande Markdown-linkaudit geeft te veel kandidaten tegelijk

`npm run content:link-audit` rapporteert in de huidige corpus 579 mogelijke
niet-gelinkte namen. Daar zitten nuttige signalen tussen, maar ook herhaalde
vermeldingen, homoniemen en contexten waarin opnieuw linken redactioneel niet
wenselijk is. Dit getal is geen maat voor ontbrekende graafrelaties. Wel is een
triageerbare audit nodig voordat de corpus veel groter wordt.

## Direct gecorrigeerd

- `MNT-028` — het relatiepaneel is herontworpen als compacte, semantische
  native-detailsstructuur met aantallen, behoud van precieze sublabels en kleine
  clusters standaard geopend.
- `MNT-029` — een herhaalbare structurele relatie-audit met unit-test en vaste
  workflowopdracht is toegevoegd.
- `MNT-012` — de ontbrekende retrospectieve contentbrief voor Grand Vin is
  vastgelegd zonder de bestaande pagina met filler uit te breiden.

## Vervolgacties

- `MNT-030` — de Markdown-linkaudit triageerbaar maken zonder kandidaten
  automatisch in links of relaties om te zetten.

## Addenda

Geen.
