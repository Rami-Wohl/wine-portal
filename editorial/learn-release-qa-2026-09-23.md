# Integrale Learn-releasecheck — 2026-09-23

Review-ID: `QCR-2026-09-23-01`

## Reikwijdte en methode

Deze review rondt `LRN-010` af voor het actieve leerpad **Van druif naar stille
wijn — hoe wijn wordt gemaakt**. De controle omvatte de Learn-catalogus, de
leerpadpagina, alle zeven kernlessen, de afsluitpagina, lokale voortgang en de
overgangen tussen Learn en canonical kennis in Explore.

De inhoud is per les in het Nederlands gelezen en tussen Nederlands en Engels
structureel vergeleken. Daarbij zijn volledigheid, volgorde, WSET Level 2-plus
als kalibratie, herhaling, wereldwijde toepasbaarheid, bronnen, interne links,
media, captions en rechten beoordeeld. De technische review controleerde
documentstructuur, toetsenbordfocus, fouttoestanden, reduced motion, 200%-reflow,
responsive gedrag op 375, 768, 1024 en 1440 CSS-pixels en de volledige
voortgangsflow. De repositorychecks en de gerichte Playwrightsuite vormen het
herhaalbare bewijs naast handmatige browsercontrole.

De review is geen nieuwe claim-by-claim onderzoeksronde voor alle algemene
vinificatiekennis. Zij toetst of de reeds onderzochte en geprovenanceerde inhoud
als curriculum betrouwbaar, evenwichtig en publiceerbaar samenwerkt.

## Samenvatting

Het pilotleerpad is inhoudelijk en technisch releasegereed. De zeven lessen
vormen een volledige hoofdroute van gezonde druif tot gebottelde stille wijn,
zonder Bordeaux als impliciet wereldmodel te gebruiken. De opbouw introduceert
grondstof en scheiding vóór vergisting, splitst daarna de drie hoofdroutes en
behandelt vervolgens omzettingen, rijping, bescherming, assemblage,
voorbereiding en botteling. De lessen herhalen noodzakelijke ankerbegrippen,
maar iedere les heeft een eigen didactische functie.

Nederlands en Engels hebben in alle zeven lessen dezelfde blockvolgorde,
entitylinks, bronnen en media. De Nederlandse en Engelse woordomvang blijft per
les vergelijkbaar. Samen gebruiken de lessen 35 unieke bronrecords en ieder
heeft minstens één inhoudelijk relevant beeld. Alle gebruikte media hebben
geregistreerde rechten, gelokaliseerde alttekst en captions.

Er zijn geen blockerende inhoudelijke, responsive, routing-, progress- of
toegankelijkheidsproblemen overgebleven.

## Bevindingen

### Inhoud en didactiek

- Het leerpad past bij de afgesproken eerste curriculumniveaukalibratie: het
  veronderstelt basiskennis van druivenras, zuur, tannine en alcohol, maar legt
  de productieroute en haar keuzes zelf uit.
- De scopegrens werkt: wijngaardkennis verschijnt alleen waar zij de kwaliteit
  van de grondstof en het kelderbesluit verklaart. Mousserende, zoete en
  versterkte wijn worden niet half in deze route opgenomen.
- Canonical entities dragen stabiele begripskennis; de lessons gebruiken die
  als naslag en behouden zelf de didactische samenhang. Naslag telt nergens mee
  voor voortgang.
- De bronverdeling past bij de claims: algemene proceskennis steunt op
  gezaghebbende vak-, onderzoeks- en institutionele bronnen zonder iedere
  algemeen geaccepteerde zin met nieuwe bronnen te overladen.

### Navigatie, media en pariteit

- Alle interne links vanuit de zeven lessen leveren een geldige pagina op en
  alle lessonmedia laden met werkelijke beeldafmetingen.
- Een Learn-link naar Explore behoudt geen kunstmatige curriculumstaat op de
  entitypagina. De teruglink naar een lesson neemt wel de unieke geldige
  pathcontext mee, zodat lespositie en vorige/volgende-navigatie terugkeren.
- De algemene Markdown-linkaudit meldt 142 nieuwe semantische
  linkkandidaten in de sinds de laatste baseline gegroeide corpus. Dit zijn
  mogelijke verrijkingen, geen gebroken links of releasefouten. Zij blijven
  volgens de bestaande `MNT-030`-workflow een afzonderlijke redactionele queue
  en blokkeren Learn niet.

### UX en toegankelijkheid

- Iedere gecontroleerde pagina heeft één `main`, één `h1`, een ononderbroken
  koppenhiërarchie, unieke IDs, benoemde bediening en tekstalternatieven voor
  beelden.
- De volledige journey heeft op 375, 768, 1024 en 1440 CSS-pixels geen
  horizontale overflow. Op een 640-pixel viewport blijft de interface ook als
  equivalent van 200% desktopzoom bruikbaar.
- Reduced motion schakelt vloeiende scroll en zichtbare overgangsduur uit.
- Corrupte of geblokkeerde browseropslag blokkeert lezen en navigeren niet;
  zonder JavaScript blijft de inhoudelijke route navigeerbaar.

## Direct gecorrigeerd

- Alle hoofdinhouden zijn programmatisch focusbaar gemaakt. Daardoor verplaatst
  de skiplink na activering niet alleen de scrollpositie, maar ook de
  toetsenbordfocus betrouwbaar naar `main`.
- De resetbevestiging houdt de oorspronkelijke knop in de interface. Annuleren
  brengt focus terug naar die knop; bevestigen brengt focus naar de bijgewerkte
  voortgangskop.
- Canonical entitypagina's linken terug naar een lesson mét pathcontext wanneer
  precies één actief leerpad die lesson bevat. Bij nul of meerdere paden blijft
  de neutrale canonical lessonroute leidend.
- De Playwrightsuite dekt voortaan alle zeven lessen, documentstructuur, media,
  interne links, skipfocus, resetfocus, reduced motion, zoom/reflow,
  releasebreakpoints en de Learn–Explore–Learn-route.

Deze correcties vallen binnen `LRN-010`; er is geen afzonderlijke
onderhoudsactie nodig.

## Vervolgacties

Geen nieuwe onderhoudsactie. Publicatie, productiecontrole,
privacyvriendelijke observatie en rollback horen bij `LRN-011` en zijn nog niet
uitgevoerd.

## Addenda

Geen.
