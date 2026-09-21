# Audit defensieve formuleringen — 2026-09-22

## Aanleiding en scope

Deze review controleert alle 263 actieve contentpackages en hun 526 Nederlandse
en Engelse documenten op de neiging om een onderwerp uit te leggen via wat het
*niet* is. De controle omvat samenvattingen, H2- en H3-koppen, gewone paragrafen,
key ideas en figureblocks. Er zijn geen feiten, bronnen, relaties of
kennisniveaus mechanisch gewijzigd.

## Methode

1. Het corpus is geïnventariseerd op expliciete ontkenningsmarkeringen in beide
   talen. Die inventaris is alleen een vindhulp: een treffer is geen fout.
2. Samenvattingen en koppen kregen extra gewicht, omdat zij het leesritme en de
   eerste indruk van een pagina bepalen.
3. Documenten met de hoogste relatieve dichtheid zijn in context gelezen. De
   eerste inhoudelijke correctieronde omvat malolactische omzetting, tannine,
   zuur, vluchtige thiolen, tweede wijn, AOP, Sauvignon Gris, Merlot Blanc,
   tweede vergisting en Place de Bordeaux, steeds in NL en EN.
4. Een ontkenning bleef staan wanneer zij een wettelijke grens, echte
   begripsverwarring, onjuiste causaliteit, risico of materiële onzekerheid
   zichtbaar maakt. Retorische stopzinnen en herhaalde
   “niet-alleen/niet-automatisch/geen-garantie”-constructies zijn waar mogelijk
   vervangen door de concrete werkzame factoren.
5. NL en EN zijn afzonderlijk geredigeerd en daarna op gelijke feitelijke scope
   gecontroleerd.

## Uitkomst

De eerste inventaris telde 6.098 markeringen, waaronder 185 samenvattingen en
739 koppen. Na de gerichte herziening rapporteert dezelfde brede zoekmethode
5.854 markeringen, 174 samenvattingen en 697 koppen. De afname is geen
kwaliteitsscore: veel resterende treffers zijn noodzakelijke afbakeningen of
gewone grammaticale ontkenningen.

De belangrijkste inhoudelijke verbetering zit in de vorm van de uitleg:

- procespagina's benoemen eerst het werkelijke mechanisme en vergelijken daarna
  alleen waar dat begrip helpt;
- proef- en kwaliteitsnuance noemt concrete factoren als balans, oogstmoment,
  producent, kelderkeuze en meetmethode;
- koppen als “Boter is geen bewijs” en “Meer is niet automatisch beter” zijn
  vervangen door inhoudelijke wegwijzers;
- samenvattingen openen vaker met identiteit en werking in plaats van een
  denkbeeldige misvatting; en
- noodzakelijke afbakeningen, bijvoorbeeld tussen tweede vergisting en
  malolactische omzetting, zijn positief opgebouwd zonder het onderscheid te
  verzwakken.

## Blijvende werkwijze

`editorial/writing-style.md` bevat nu de bindende
positieve-herformuleringstest. `docs/content-authoring.md` maakt die test een
vaste publicatiestap. `npm run content:language-audit` inventariseert voortaan
alle actieve lokalisaties en rangschikt documenten voor menselijke review.
Het commando faalt bewust niet op aantallen en mag nooit automatische
prozaherschrijving aansturen.

## Besluit

De corpusbrede scan, de gerichte redactie van de dichtste en meest zichtbare
patronen en de permanente authoringregel ronden `MNT-037` af. Nieuwe content
wordt bij iedere sectiereview tegen dezelfde regel gehouden. Een toekomstige
kwaliteitsreview kan de inventaris opnieuw gebruiken wanneer het corpus groeit;
de resterende woorden *niet*, *geen*, *not* en *never* vormen op zichzelf geen
onderhoudsachterstand.
