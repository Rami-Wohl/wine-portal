# Contentbrief — Jaarcyclus en fenologie van de wijnstok

Datum: 2026-09-25. Uitvoering van `EXP-005`; outline, bronnenplan en entitygrens zijn gereviewd vóór authoring.

## Veronderstelde voorkennis

De lezer weet dat een wijnstok wortels, blijvend hout, knoppen, scheuten, bladeren, bloemen en druiven heeft. `concept.vine-as-living-system` bezit die anatomie en de source–sink-uitleg. Deze pagina herhaalt daarvan alleen wat nodig is om de volgorde door het jaar te begrijpen.

## Paginabelofte en scope

Na afloop kan de lezer de jaarlijkse cyclus volgen van winterrust via sapstroom, uitloop, bloei, vruchtzetting, besgroei, véraison, rijping en oogst naar bladval en reserveopbouw. De lezer begrijpt daarnaast dat fenologische fasen waargenomen ontwikkelingsstadia zijn, geen vaste kalenderdata, en dat een wijngaard zelden in één oogwenk volledig van fase wisselt.

Bloembiologie, vruchtzettingsproblemen en opbrengstcomponenten horen bij `EXP-006`. Beschemie, meerdere vormen van rijpheid en oogstsampling horen bij `EXP-007`. Klimaatmechanismen en klimaatverandering krijgen hun volledige owner in `EXP-008`. Deze pagina benoemt hun rol alleen voor de timing en samenhang van de cyclus.

## Lezersvragen

1. Wat betekent fenologie en waarom registreren wijnbouwers fasen in plaats van alleen data?
2. Welke hoofdgebeurtenissen volgen elkaar op, welke overlappen en welke verbinden twee seizoenen?
3. Wat gebeurt er tijdens schijnbare winterrust en bij het opnieuw op gang komen van de stok?
4. Waardoor verschuift de timing tussen rassen, plaatsen, jaren en hemisferen?
5. Welke beslissingen en risico’s worden door het actuele stadium bepaald?
6. Hoe helpen E-L/BBCH-schalen en temperatuurmodellen, en waar liggen hun grenzen?

## Entitygrens en dependencies

`concept.grapevine-phenology` wordt de canonical owner van de jaarlijkse cyclus en de observatietaal voor ontwikkelingsstadia. `concept.vine-as-living-system` en `concept.vintage` worden gelinkt en als relaties opgenomen. Er ontstaan nu geen losse entities voor winterrust, uitloop, bloei, véraison of bladval: hun eerste complete uitleg past binnen deze route. De entitygrenzen worden opnieuw beoordeeld wanneer `EXP-006` en `EXP-007` hun eigen zelfstandige scope uitwerken.

## Kennisdiepte

- **Basis (WSET 2+):** definitie van fenologie, volledige volgorde, zichtbare kenmerken van iedere fase en waarom timing ertoe doet.
- **Verdieping (WSET 3+):** winterrust is fysiologisch gelaagd; fasen overlappen binnen stok en wijngaard; cultivar, site, weer en beheer verschuiven timing; post-harvestblad draagt bij aan reserves.
- **Gevorderd (WSET 4+):** E-L/BBCH als observatieprotocollen, chill/forcing en temperatuurmodellen, spreiding rond een stadium en grenzen van kalender- en modelvergelijkingen.

## Bronnenplan

De AWRI groeischaal draagt de gestandaardiseerde volgorde; de AWRI-notitie over dormantie draagt de vroege cyclus en reserveafhankelijkheid. New Mexico State University ondersteunt de volledige jaarroute en de vegetatieve/reproductieve tweeseizoensrelatie. Cornell draagt knop- en bloeiontwikkeling. Peer-reviewed studies van Cameron, Parker en Hall ondersteunen variatie tussen temperatuurintervallen, cultivars en de post-harvestperiode. Sperry ondersteunt de rol van positieve worteldruk bij het hervullen van xyleem in het voorjaar. De bestaande AWRI-bron over berry ripening begrenst véraison en rijping zonder `EXP-007` te dupliceren.

## Visual teaching contract

**Teaching question:** welke twaalf herkenbare fasen verbinden winterrust met een volgend groeiseizoen, zonder te suggereren dat iedere stok op één vaste datum omschakelt?

Een taalneutrale schematisch-naturalistische cyclusplaat toont exact twaalf genummerde vignetten: winterrust, bloeden/sapstroom, uitloop, scheutgroei, bloei, vruchtzetting, groene besgroei, véraison, rijping, oogst, bladveroudering/-val en reserveopbouw met afgerijpt hout. De volgorde loopt met de klok mee en keert zichtbaar terug naar winterrust. Er staan geen maandnamen, seizoensnamen, woorden, letters of regionale landschapselementen in het raster. De gelokaliseerde HTML legt ieder nummer uit.

Botanische eisen: bloemen zijn klein en groen; vruchtzetting volgt bloei; véraison toont geen volledig rijpe tros; bladverkleuring en houtafrijping volgen oogst zonder te impliceren dat oogst altijd vóór iedere reserveopbouw begint. Het beeld is een procesmodel, geen kalender of momentopname van één stok.

## Iteratie- en publication gate

Iedere sectie wordt herlezen op volledige volgorde, overlap, juiste diepte, mondiale toepasbaarheid, positieve formulering en uitbesteding aan de latere owners. NL en EN krijgen dezelfde blocks, claims, links en visual. Publicatie volgt pas na broncontrole, contentvalidatie, visuele review op smal en breed scherm, zoekcontrole en bijgewerkte roadmap/coverage.

## Productieresultaat en iteratielog

- **Outline-review:** alle acht dimensies uit het system-overview-archetype zijn op de pagina vertegenwoordigd; detail over bloembiologie, rijpheid en klimaatmechanismen blijft bij de geplande vervolgowners.
- **Volledigheidsreview:** de cyclus loopt van rust en bloeden via groei en reproductie naar oogst, bladval en reserveopbouw; de verbinding over twee groeiseizoenen en de overlap binnen stok en perceel zijn expliciet gemaakt.
- **Dieptereview:** zichtbare volgorde en betekenis staan op basisniveau; fysiologische overgang, post-harvest en tweeseizoensontwikkeling op verdieping; modelkalibratie en temperatuurrespons op gevorderd.
- **Mondiale review:** maandnamen ontbreken als ordeningsprincipe; beide hemisferen en gematigde, koele en warme/subtropische groeicondities zijn meegenomen.
- **Visual review:** de definitieve rasterillustratie bevat exact twaalf genummerde, taalneutrale stadia. Alle betekenis staat in gelokaliseerde HTML, zodat vertaling en toegankelijkheid niet van tekst in het beeld afhangen.
- **Publicatiecheck:** Nederlandse en Engelse blocks, citations, links, mediaregistratie en content-plan zijn inhoudelijk gelijkgetrokken en door de contentvalidator geaccepteerd.
