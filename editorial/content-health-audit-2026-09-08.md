# Content-health-audit — 2026-09-08

Review-ID: `QCR-2026-09-08-01`

De actuele opvolging van dit rapport staat in de
[algemene onderhoudsbacklog](../docs/maintenance-backlog.md). Dit rapport blijft
de momentopname van de controle op 2026-09-08.

## Reikwijdte en methode

Deze onderhoudsreview omvat alle 23 entities die op 2026-09-08 `active` zijn. De
controle vergelijkt de packages met de productprincipes, kennisarchitectuur,
contentblocks, authoringworkflow, researchpolicy, schrijfstijl en visuele taal.
Daarnaast zijn blockpariteit, headings, kennisdiepten, interne links,
reviewdatums, contentplannen, briefs en geregistreerde media geïnventariseerd.

Dit is een redactionele systeemreview en geen volledige herhaling van al het
brononderzoek op iedere zin. Structurele geldigheid bewijst geen feitelijke
waarheid; veranderlijke claims blijven hun eigen verificatiedatum en toekomstige
bronreview nodig hebben.

## Samenvatting

- Alle actieve packages hebben Nederlandse en Engelse content met dezelfde
  semantische blockstructuur en geldige bron- en mediareferenties.
- Publieke proza bevat geen gevonden termen als `provenance`, `source_refs`,
  `pipeline`, `knowledge graph` of raw entity-ID-taal.
- De vijf druivenoverzichten hebben ieder twee documentaire beelden en een
  afgerond contentplan. Hun geografische weging volgt in algemene zin het ras en
  niet alleen de huidige Bordeaux-opbouw.
- Barsac, Pauillac en Sauternes hebben afgeronde contentplannen. Bordeaux heeft
  eveneens een afgerond region-overview-plan.
- De vier actieve producenten vallen terecht in de nieuwe schaal `iconisch` en
  hebben ieder een landgoed- en flesfoto. Hun lengteverschil is inhoudelijk
  verdedigbaar: Yquem vraagt naast châteaugeschiedenis ook botrytis, zoete wijn en
  Y als afzonderlijke droge wijn.
- Negen actieve concept- of classificatiepagina's hebben geen beeld. Dat is het
  duidelijkste visuele onderhoudsgat.
- De algemene assemblagepagina is niet geografisch fout geschreven, maar haar
  uitleg en bronbasis leunen te sterk op Bordeaux. Dit is de voornaamste
  inhoudelijke kandidaat voor een wereldwijde verbreding.

## Direct in deze review gecorrigeerd

1. `MNT-015` — Botrytis is op de Bordeauxpagina expliciet naar de basislaag gehaald; de
   verdere uitleg is van `advanced` naar `intermediate` verplaatst.
2. `MNT-016` — Praktisch serveren en combineren is bij Barsac en Sauternes van `advanced`
   naar `intermediate` verplaatst. Dit past beter bij de WSET-kalibratie en bij de
   betreffende contentplannen.
3. `MNT-017` — `Onderstam / Rootstock` op de Merlotpagina linkt nu naar
   `concept.rootstock`; daarmee is de bekende linkauditachterstand opgelost.
4. `MNT-018` — De Yquemkop begint nu met de gestandaardiseerde categorie `Druivenrassen /
   Grape varieties`.
5. `MNT-019` — De producentenworkflow onderscheidt voortaan `iconisch`, `kernproducent` en
   `referentieproducent`, zonder daarvan een publieke kwaliteitsrang te maken.

## Review per actieve entity

| Entity | Richtlijnen en kennisdiepte | Geografische balans | Beeld | Vervolg |
| --- | --- | --- | --- | --- |
| `region.bordeaux` | Goed na botrytiscorrectie; brede basis en werkelijk gevorderde historische, juridische en klimatologische details. | Bordeaux is hier vanzelfsprekend de scope. | 1 foto. | Hoge prioriteit: geverifieerde Atlas-kaart; daarnaast één documentair beeld dat water/handel of de linkeroever aanvult. |
| `appellation.pauillac` | Goed; rang, producenten, regels en stijl zijn duidelijk gescheiden. | Scopegebonden, geen probleem. | 1 foto. | Tweede documentair beeld of toekomstige kaart toevoegen; geen extra châteauportret als vervanging voor appellationcontext. |
| `appellation.sauternes` | Goed na demotie van praktische serveercontext; botrytis staat terecht in de basislaag. | Scopegebonden en Barsac wordt zorgvuldig onderscheiden. | 2 foto's. | Toekomstige kaart van de vijf gemeenten en geverifieerde productiezone. |
| `appellation.barsac` | Goed na demotie van praktische serveercontext; dubbele naam en juridische grens zijn helder. | Scopegebonden en Sauternes-overlap is begrensd. | 2 foto's. | Toekomstige kaart van gemeente, appellationzone en productiepercelen. |
| `classification.bordeaux-1855` | Goed; ontstaan, ladders en betekenis zijn compact en juist gelaagd. | Bordeaux is de definitie van de entity. | Geen. | Hoge prioriteit: toegankelijke classificatiehiërarchie of rechtenvrije historische documentweergave. |
| `concept.ampelography` | Goed; methode, kenmerken en DNA-grens lopen van basis naar gevorderd. | Volledig geografieneutraal. | Geen. | Hoge prioriteit: educatieve visual van scheuttop, blad, tros, bes en pit of een documentaire veldvergelijking. |
| `concept.assemblage` | Goed als definitie, maar de algemene toepassing is nog smal geïllustreerd. Juridisch detail staat terecht op gevorderd. | Proza is grotendeels neutraal; bron- en voorbeeldbasis is Bordeaux-zwaar. | Geen. | Hoge inhoudelijke prioriteit: wereldwijd verbreden met bijvoorbeeld multi-vintage, mousserende en niet-Bordeaux-rassen-/perceelassemblage; procesdiagram toevoegen. |
| `concept.autolysis` | Goed en voorzichtig causaal geformuleerd; technisch detail staat op gevorderd. | Geografieneutraal, maar zonder herkenbare toepassingen. | Geen. | Voeg later traditionele mousserende wijn en andere relevante liescontext als begrensde voorbeelden toe; deel waar mogelijk een visual met liesrijping. |
| `concept.batonnage` | Goed; handeling, mogelijk effect en risico zijn goed gescheiden. | Geografieneutraal. | Geen. | Procesvisual van bezonken en opgeroerde lies is zinvol. |
| `concept.clonal-selection` | Goed; betekenis, doel en genetische grenzen zijn passend gelaagd. | Geografieneutraal. | Geen. | Visual over selectie, vermeerdering en behoud van variantie is zinvol. |
| `concept.grand-vin` | Goed; Bordeaux-focus hoort bij de gebruiksgeschiedenis van de term en wordt juridisch begrensd. | Bewuste, inhoudelijke Bordeaux-scope; geen projectbias. | 1 illustratie. | Contentbrief is nog wenselijk als procesdocument; geen extra proza nodig zonder nieuwe lezersvraag. |
| `concept.lees-ageing` | Goed; lies, autolyse, bâtonnage en risico zijn onderscheiden. | Geografieneutraal, maar zonder concrete wijnstijlcontext. | Geen. | Voeg later enkele wereldwijd relevante toepassingen en een gedeelde liesvisual toe. |
| `concept.methoxypyrazines` | Goed; molecuul, druif, waarneming en kwaliteitsgrens zijn netjes gescheiden. | Druifgericht en internationaal bruikbaar. | Geen. | Diagram van concentratie, rijping en waarneming kan de causale keten verduidelijken. |
| `concept.volatile-thiols` | Goed; chemie begint begrijpelijk en afkortingen blijven gevorderd. | Sauvignon is het logische anker zonder Bordeaux-overwicht. | Geen. | Visual van geurloze precursor via gisting naar vluchtig aroma is zeer geschikt. |
| `grape.cabernet-franc` | Goed en volledig volgens grape-overview; gevorderd bevat genetica, nuance en uitzonderingen. | Bordeaux en Loire zijn terecht de twee Franse hoofdassen; mondiale rollen zijn aanwezig maar kunnen later iets ruimer. | 2 foto's. | Bij wereldwijde uitbreiding Friuli, koelere Nieuwe-Wereldregio's en lokale varianten opnieuw wegen; geen urgente reparatie. |
| `grape.cabernet-sauvignon` | Goed; basis herkenbaar, verdieping causaal, gevorderd technisch. | Bordeaux, Californië, Australië, Chili en andere rollen zijn zichtbaar. | 2 foto's. | Geen inhoudelijke blocker; toekomstige Atlasdekking zal de wereldspreiding beter tonen. |
| `grape.merlot` | Goed; onderstamlink is hersteld en klimaat-/waternuance blijft begrensd. | Bordeaux is oorsprong en belangrijk referentiepunt, maar Toscane, Chili en andere rollen voorkomen exclusiviteit. | 2 foto's. | Geen urgente reparatie; mondiale voorbeelden bij volgende bronreview opnieuw wegen. |
| `grape.sauvignon-blanc` | Goed; Loire en Nieuw-Zeeland zijn minstens zo bepalend behandeld als Bordeaux. | Beste geografische balans van de huidige druivencluster. | 2 foto's. | Geen urgente reparatie. |
| `grape.semillon` | Goed; botrytis staat terecht in de basislaag en Australië vormt een gelijkwaardige tweede hoofdas. | Bordeaux en Australië zijn inhoudelijk gemotiveerd, niet projectmatig. | 2 foto's. | Geen urgente reparatie. |
| `producer.chateau-lafite-rothschild` | Goed voor schaal `iconisch`; geschiedenis, Grand Vin, Carruades en uitgifte zijn proportioneel. | Bordeaux is de volledige producentcontext. | 2 foto's. | Bij veranderlijke cijfers en leiding reguliere herverificatie blijven doen. |
| `producer.chateau-latour` | Goed voor schaal `iconisch`; Enclos, drie wijnen en afwijkend uitgiftemodel rechtvaardigen verdieping. | Bordeaux is de volledige producentcontext. | 2 foto's. | Bij uitgiftebeleid en eigendom reguliere herverificatie blijven doen. |
| `producer.chateau-mouton-rothschild` | Goed voor schaal `iconisch`; promotie, château-botteling en kunstenaarslabels zijn echte leerwaarde, geen trivia. | Bordeaux is de volledige producentcontext. | 2 foto's. | Kunstenaarscatalogus bewust buiten de entity houden; actuele eigendom blijven dateren. |
| `producer.chateau-d-yquem` | Goed voor schaal `iconisch`; extra lengte wordt gedragen door botrytis, classificatie, Y en uitzonderlijke selectie. | Bordeaux/Sauternes is de volledige producentcontext. | 2 foto's. | Toegankelijke vervangers of archief-URL's zoeken voor vier verdwenen officiële deelpagina's; een tries-visual is optioneel. |

## Geprioriteerde onderhoudsbacklog

De onderstaande lijst bewaart wat tijdens deze review werd vastgesteld. De
actuele status en uitvoeringsgeschiedenis staan onder `MNT-001` t/m `MNT-014` in
de [algemene onderhoudsbacklog](../docs/maintenance-backlog.md).

### Hoog

1. `MNT-001` — `concept.assemblage` wereldwijd verbreden en de bronbasis minder afhankelijk
   maken van het CIVB.
2. `MNT-002` — Een geverifieerde Atlas-kaart voor Bordeaux ontwerpen zodra de GIS-laag dit
   betrouwbaar ondersteunt.
3. `MNT-003` t/m `MNT-005` — Visuals toevoegen aan `classification.bordeaux-1855`,
   `concept.ampelography` en de cluster autolyse–liesrijping–bâtonnage.
4. `MNT-006` — De verdwenen officiële Yquem-deelpagina's vervangen door toegankelijke nieuwe
   primaire of gecontroleerde archiefbronnen zonder de oude provenance te wissen.

### Middel

1. `MNT-007` — Pauillac een tweede beeld geven dat de appellation uitlegt in plaats van één
   beroemd château uit te vergroten.
2. `MNT-008` t/m `MNT-010` — Methoxypyrazinen, vluchtige thiolen en klonale selectie met verklarende
   procesvisuals ondersteunen.
3. `MNT-011` — Autolyse en liesrijping voorzien van herkenbare toepassingen buiten de huidige
   abstracte mechanisme-uitleg.
4. `MNT-012` — Voor `concept.grand-vin` een compacte retrospectieve contentbrief toevoegen.

### Laag of afhankelijk van Atlas

1. `MNT-013` — Wereldwijde druivenverspreiding later via geverifieerde kaarten tonen.
2. `MNT-014` — Gemeente-, appellation- en productiegrenzen van Barsac en Sauternes pas tonen
   wanneer officiële geometrie en schaalbetekenis zijn vastgelegd.
3. `MNT-019` — Geen extra producentenproza schrijven alleen om paginalengtes gelijk te maken;
   pas de nieuwe redactionele schaal per brief toe.
