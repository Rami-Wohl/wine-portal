# Learn-productbrief

Status: goedgekeurd productcontract voor de anonieme MVP  
Datum: 2026-09-23  
Roadmapticket: `LRN-001`

## Productbelofte

Learn helpt geïnteresseerde wijnliefhebbers hun losse kennis om te zetten in een
samenhangend begrip van wijn. Een leerpad ordent zorgvuldig geschreven lessen
en verwijst onderweg naar de canonical kennisbank voor naslag. De gebruiker kan
zonder account beginnen, een duidelijke volgorde volgen, bewust voortgang
markeren en later in dezelfde browser verdergaan.

Learn is geen examenomgeving, geen vervanger van Explore en geen tweede opslag
voor wijnfeiten.

## Primaire pilotgebruiker

De eerste pilot richt zich op de eerste van drie beoogde curriculumniveaus. De
gebruiker heeft ongeveer de voorkennis en begripsbasis rond WSET Level 2, via een
opleiding of zelfstudie, en wil verder leren dan alleen herkenning van gangbare
druiven, regio's en productiemethoden.

Een formeel WSET-diploma is geen toegangseis. De vergelijking is een
redactionele kalibratie van voorkennis en diepgang, geen claim van officiële
WSET-erkenning, volledige examendekking of voorbereiding op een specifiek
examen.

## Drie curriculumniveaus

Learn krijgt uiteindelijk drie oplopende niveaus:

1. ongeveer **WSET Level 2 plus**;
2. ongeveer **WSET Level 3 plus**;
3. ongeveer **WSET Level 4 plus**.

Het plusteken betekent dat Oenocademy zich niet beperkt tot een examenkader.
Een les mag noodzakelijke verbanden, uitleg of voorbeelden toevoegen wanneer
die het onderwerp beter begrijpelijk maken. De niveaus blijven globale
referentiepunten en worden geen kopie van een extern curriculum.

De publieke namen zijn:

1. **Wijn begrijpen** — globaal WSET Level 2 plus;
2. **Wijn verklaren** — globaal WSET Level 3 plus;
3. **Wijn doorgronden** — globaal WSET Level 4 plus.

De eigen naam is het primaire label in de interface. De WSET-vergelijking mag
als kalibrerende toelichting worden gebruikt, maar is geen productnaam,
certificeringsclaim of automatische koppeling met entitydiepte.

## Leerniveau is niet hetzelfde als kennisdiepte

Oenocademy heeft al een kennisdieptefilter binnen entitypagina's:
`foundation`, `intermediate`, `advanced` en `specialist`. Dat model beantwoordt
de vraag hoeveel detail een lezer binnen die ene pagina wil zien. Het zegt niet
op welk curriculumniveau het onderwerp als geheel thuishoort.

De twee assen blijven daarom strikt gescheiden:

- **Kennisdiepte** is lokaal en relatief aan één entitydocument.
- **Leerniveau** beschrijft de voorkennis, doelen en didactische diepgang van een
  les of leerpad.

Een foundation-block over een zeer niche château kan buiten ieder algemeen
WSET-curriculum vallen. Omgekeerd kan een advanced-block op een fundamentele
vinificatiepagina kennis bevatten die voor een WSET Level 3-plus les
noodzakelijk is. Er bestaat daarom geen automatische vertaling van een
contentdepth naar een leerniveau.

Bij het ontwerpen van iedere les bepaalt de auteur expliciet:

1. welke entities nodig zijn;
2. welke concrete block-IDs of kennisclaims uit die entities relevant zijn;
3. welke uitleg in de les nodig is om er een samenhangend leeronderdeel van te
   maken;
4. welke entitycontent alleen optionele naslag is;
5. welke kennis bewust buiten het gekozen curriculumniveau valt.

Deze selectie wordt onderdeel van de lesbrief en contentgap-analyse. De les
kopieert de entityproza niet en een leerpad onthult niet simpelweg automatisch
een bepaald depthniveau op alle gekoppelde pagina's.

## Publieke terminologie

De MVP gebruikt deze woorden:

- **Leerpad** — een volledige, geordende leerroute;
- **Les** — een inhoudelijk kernonderdeel binnen of buiten een leerpad;
- **Naslag** — gekoppelde canonical entitycontent die extra uitleg geeft;
- **Voortgang** — de stand binnen een leerpad;
- **Voltooid** — een status die alleen door een bewuste gebruikersactie ontstaat;
- **Onderdeel** — een verzamelwoord wanneer lessen en naslag samen worden
  bedoeld.

Deze woorden staan los van de bestaande labels van de kennisdieptefilter.

## Gewenste gebruikersreis

1. De gebruiker opent Learn en ziet welke leerpaden beschikbaar zijn.
2. De gebruiker opent een leerpad en begrijpt doelgroep, voorkennis,
   leerdoelen, omvang en lesvolgorde.
3. De gebruiker start een les en ziet de positie binnen het pad.
4. Vanuit de les kan de gebruiker naslag openen en daarna de leerroute hervatten.
5. De gebruiker markeert een les bewust als voltooid en gaat verder.
6. Na de laatste vereiste les bereikt de gebruiker een succesbestemming.
7. Learn kan bij een volgend bezoek lokaal een passende doorgaanactie tonen.

Iedere les blijft ook zonder leerpadcontext zelfstandig leesbaar. Uitval van
JavaScript of browseropslag blokkeert de content en volgordenavigatie niet.

## Succesbestemming aan het einde

Ieder voltooid leerpad eindigt met een rustige, positieve succespagina of
gelijkwaardige eindbestemming. Deze bevat minimaal:

- een helder overzicht van wat de gebruiker in het leerpad heeft geleerd;
- een oprecht en passend compliment dat inspanning erkent zonder een
  kwalificatie of bewezen beheersing te veinzen;
- een mogelijkheid om het leerpadoverzicht opnieuw te bekijken;
- zorgvuldig gekozen vervolgsuggesties, zoals een volgend leerpad, een
  verdiepende les of relevante naslag;
- een duidelijke weergave van de lokale voltooiingsstatus wanneer opslag
  beschikbaar is.

De pagina is geen certificaat en claimt niet dat de gebruiker de stof heeft
beheerst. Zonder opgeslagen voortgang kan de eindbestemming nog steeds de
afgeronde route samenvatten, maar formuleert zij geen niet-aantoonbare
persoonlijke voltooiingsclaim.

## Succescriteria voor de MVP

De MVP is productmatig geslaagd wanneer een gebruiker zonder hulp:

- een passend leerpad kan vinden;
- vooraf begrijpt wat het pad behandelt en welke voorkennis wordt verwacht;
- lessen in de bedoelde volgorde kan volgen;
- naslag kan openen zonder de context van het leerpad kwijt te raken;
- bewust lessen kan voltooien of heropenen;
- na refresh en bij een volgend bezoek lokaal kan doorgaan;
- de succesbestemming bereikt en begrijpt wat is geleerd en wat een logische
  vervolgstap is;
- alle content en navigatie kan gebruiken wanneer lokale opslag niet werkt.

De MVP meet nog niet objectief hoeveel kennis iemand heeft onthouden. Quizzen,
examens en certificering zijn geen voorwaarde om de leerstructuur, inhoud en
navigatie te valideren.

## Niet nodig voor de pilot

- accountregistratie of authenticatie;
- API of database voor gebruikersvoortgang;
- cross-device synchronisatie;
- toetsen, scores of certificaten;
- streaks, badges of andere gamification;
- persoonlijke aanbevelingen op basis van profieldata;
- docent-, cohort- of beheerfuncties;
- een complete mondiale wijncurriculumtaxonomie.

## Gevolg voor het vervolg

`LRN-002` ontwerpt nu het eerste leerpad tegen dit contract. Daarbij worden de
lesindeling en de exacte selectie van entityblocks als afzonderlijke
beslissingen vastgelegd. Pas die echte curriculumoutline bepaalt welke nieuwe
content en welk learning-pathschema nodig zijn.
