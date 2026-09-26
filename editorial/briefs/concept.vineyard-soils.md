# Contentbrief — Wijngaardbodems

Datum: 2026-09-26  
Roadmapticket: `EXP-010`  
Voorgesteld package: `concept.vineyard-soils`  
Archetype: `concept-system-overview`

Dit is het besluitrijpe research- en modelresultaat vóór publicatie. `EXP-011`
mag het package en de satellites pas scaffolden nadat `DEC-EXP-003` de lijst
onder **Entitybesluit** heeft goedgekeurd.

## Voorkennis, paginabelofte en ownership

- **Veronderstelde voorkennis:** de lezer kent de waterroute uit
  `concept.vine-water-relations` en begrijpt uit
  `concept.climate-weather-site-microclimate` dat bodem één onderdeel van een
  standplaats is.
- **Na afloop begrijpt de lezer:** hoe een bodemprofiel is opgebouwd; welke
  fysische, chemische en biologische eigenschappen wortels werkelijk ervaren;
  hoe die eigenschappen via water, lucht, temperatuur, bewortelbaar volume en
  nutriënten de wijnstok kunnen beïnvloeden; en waarom gesteente of bodemnaam
  geen proefnotitie voorspelt.
- **Deze pagina is de canonical eigenaar van:** het systeemmodel van
  wijngaardbodems, de gemeenschappelijke vergelijkingsmethode en de
  alfabetische directory van veelgebruikte bodem- en gesteentetermen.
- **Deze pagina bezit bewust niet:** volledige waterfysiologie (`EXP-009`),
  snoei en loofwand (`EXP-012`), bemesting, bodembeheer en wijngaardvloer
  (`EXP-013`), ziekten en plagen (`EXP-014`), brede duurzaamheid (`EXP-015`) of
  de volledige sensorische betekenis van *minerality* (`EXP-025`). Regionale
  bodemprofielen en precieze geografie blijven eigendom van hun regio- of
  appellationpagina.
- **Parenthub of bovenliggende context:** Wijngaardomgeving en
  wijnbouwbeslissingen; inhoudelijk verbonden met `concept.terroir`.

## Centraal verklaringsmodel

Iedere directoryterm wordt langs exact dezelfde keten gelezen:

```text
naam en geologische/pedologische categorie
                    ↓
profiel + textuur + structuur + poriën + bewortelbaar volume
                    ↓
water + lucht + temperatuur + chemie + levende bodem
                    ↓
wortelverdeling + water- en nutriëntenstatus + groeipatroon
                    ↓
druifuitkomst in wisselwerking met klimaat, ras, onderstam en beheer
                    ↓
geen automatische smaak- of kwaliteitsuitkomst
```

Een gesteentenaam wordt dus nooit rechtstreeks naar aroma vertaald. Het model
zoekt eerst de eigenschappen van het werkelijke bodemprofiel en daarna de
reactie van de plant in een concreet seizoen.

### Verplichte vergelijkingsvelden

Iedere alfabetische directory-entry gebruikt dezelfde compacte velden. Een
onbekende of sterk variabele eigenschap wordt als zodanig benoemd en niet uit de
naam afgeleid.

1. **Categorie:** deeltjesfractie, textuurklasse, afzetting, moedermateriaal,
   gesteente of bodemnaam.
2. **Wat ligt er werkelijk:** korrelgrootte, grove fragmenten, verweringsgraad,
   horizonten en eventuele ondergrond.
3. **Textuur en structuur:** verhouding zand–silt–klei, aggregaten, scheuren en
   poriën; gesteente alleen wanneer het deel van de wortelzone is.
4. **Bewortelbaar volume:** profieldiepte, penetratieweerstand, spleten,
   verdichting en beperkende lagen.
5. **Water en lucht:** infiltratie, drainage, opslag van plantbeschikbaar water,
   capillaire werking, afstroming en risico op zuurstofgebrek.
6. **Temperatuur:** kleur, vocht, stenigheid, bedekking, expositie en beheer als
   factoren; geen vaste warm/koud-eigenschap uit één naam.
7. **Chemie en voeding:** pH, carbonaten, zout, kationenuitwisseling,
   organische stof en beschikbaarheid van nutriënten, met onderscheid tussen
   totaal gehalte en opneembare vorm.
8. **Levende en beheerde bodem:** wortels, micro-organismen, organische stof,
   vegetatie, bewerking, erosie en compactie.
9. **Context en meetgrens:** klimaat, ras, onderstam, leeftijd, seizoen,
   profielvariatie en schaal van de waarneming.
10. **Betekenis voor de wijnstok:** alleen de onderbouwde indirecte routes; geen
    beloofd aroma, textuur of kwaliteitsniveau.

## Bronnenset en functie

| Source-ID | Functie in het model | Belangrijke grens |
| --- | --- | --- |
| `source.maltman-vineyards-rocks-soils-2018` | Geologische terminologie, verwering, onderscheid mineraal–gesteente–bodem en kritiek op letterlijke geologische smaakclaims | Toegankelijke geologische synthese; vervangt geen plantfysiologie of bodemgezondheidsonderzoek |
| `source.parr-maltman-minerality-2018` | Sensorische en chemische review van *minerality* en de variatie in wat proevers daarmee bedoelen | Draagt geen universele positieve definitie van minerality |
| `source.van-leeuwen-soil-terroir-2018` | Wijnstokreactie via wateraanvoer, stikstofvoorziening en bodemtemperatuur | Terroiruitkomsten blijven context- en doelafhankelijk |
| `source.white-soil-terroir-2020` | Brede bodem–terroirsynthese, interacties en grenzen van kwantitatieve causale claims | Benoemt juist waar algemeen geldige relaties ontbreken |
| `source.lazcano-healthy-vineyard-soils-2020` | Inherente versus dynamische eigenschappen, bodemfuncties, organische stof, biologie en beheer | Soil health is geen enkel getal en microbiële routes naar wijn vragen terughoudendheid |
| `source.oliver-soil-quality-viticulture-2013` | Fysische en chemische indicatoren voor wijngaardbodemkwaliteit | Australische review; drempelwaarden worden niet wereldwijd gekopieerd |
| `source.nrcs-available-water-capacity` | Textuur, structuur, profieldiepte, grove fragmenten, organische stof en verdichting in relatie tot plantbeschikbaar water | Algemene bodemfysica; geen wijnkwaliteitsbron |
| `source.nrcs-soil-health-assessment` | Gemeenschappelijke fysieke, chemische en biologische meetfamilies | Indicatorselectie moet bij bodemfunctie en lokale context passen |
| `source.usgs-lithologic-classification` | Normalisatie en afbakening van gesteentetermen | Classificeert gesteente, niet het gedrag van een volledig wijngaardprofiel |
| `source.cornell-grapevine-roots` | Wortelarchitectuur en de daadwerkelijke wortelomgeving van de wijnstok | Een algemeen wortelmodel voorspelt geen lokale bewortelingsdiepte |

Deze set ondersteunt het hubmodel. `EXP-011` voegt gerichte bronnen toe voor de
twee voorgestelde satellites en voor specifieke regionale voorbeelden of
foto-onderschriften; één review wordt niet tot bewijs voor ieder bodemtype
uitgerekt.

## Genormaliseerde terminologie en directorybesluit

De publieksdirectory mag vertrouwde namen alfabetisch tonen, maar vermeldt bij
iedere naam welk soort term het is. De Engelse en Nederlandse labels hieronder
zijn de beoogde displaylabels, geen bewering dat alle termen één-op-één
internationale bodemclassificaties zijn.

| Invoerterm | Categorie | Display NL / EN | Normalisatie en grens | Voorgesteld besluit |
| --- | --- | --- | --- | --- |
| alluvium | afzetting | Alluvium / Alluvium | Door stromend water afgezet, mogelijk zeer uiteenlopend in ouderdom, korrelgrootte en profiel | hub-entry |
| basalt | stollingsgesteente | Basalt / Basalt | Eén mogelijk vulkanisch moedermateriaal; verwering en profiel bepalen de wortelomgeving | hub-entry binnen vulkanische satellite |
| chalk | carbonaatgesteente | Krijt / Chalk | Zachte, poreuze vorm van kalksteen; niet synoniem met iedere kalkrijke bodem | hub-entry met kruisverwijzing naar kalksteen |
| clay | deeltjesfractie en mineralenfamilie | Klei / Clay | Kan de fijne fractie, kleimineralen of informeel een kleirijke textuur bedoelen; context verplicht | hub-entry |
| flint/chert | silicaatgesteente | Vuursteen / Flint or chert | Samengevoegde directory-entry met regionale naamvarianten; grove fragmenten zeggen niet alleen hoe het profiel functioneert | hub-entry |
| granite | dieptegesteente | Graniet / Granite | Vast gesteente en verweerd granietmateriaal worden onderscheiden | hub-entry |
| gravel | grove deeltjes of afzetting | Grind / Gravel | Deeltjes groter dan zand; matrix, diepte en sortering bepalen mede poriën en watergedrag | hub-entry |
| limestone | carbonaatgesteente | Kalksteen / Limestone | Gesteente, niet automatisch een kalkrijke bovengrond; profiel, carbonaten en pH afzonderlijk beschrijven | hub-entry binnen kalkrijke satellite |
| loam | textuurklasse | Leem / Loam | Mengtextuur van zand, silt en klei; Nederlandse vak- en omgangsterminologie vraagt een heldere definitie | hub-entry |
| marl | carbonaat- en kleirijk sediment/gesteente | Mergel / Marl | Verhoudingen en gebruik van de naam variëren; geen vast fysisch gedrag zonder analyse | hub-entry binnen kalkrijke satellite |
| sand | deeltjesfractie of zandrijke textuur | Zand / Sand | Korrelgrootte, sortering, organische stof, structuur en profieldiepte bepalen de werking | hub-entry |
| schist | metamorf gesteente | Schist / Schist | Schistositeit en verwering verschillen van leisteen; niet als synoniem behandelen | hub-entry |
| shale | sedimentair gesteente | Schalie / Shale | Fijn gelaagd sedimentair gesteente; onderscheiden van klei, schist en leisteen | hub-entry |
| silt | deeltjesfractie | Silt / Silt | Fijner dan zand en grover dan klei; gevoeligheid voor structuur en erosie niet uit fractie alleen afleiden | hub-entry |
| slate | metamorf gesteente | Leisteen / Slate | Splijt langs leisteensplijting; onderscheiden van schist en schalie | hub-entry |
| terra rossa | bodemnaam/familie | Terra rossa / Terra rossa | Rode, vaak kleirijke bodem geassocieerd met carbonaatlandschappen; geen wereldwijd uniforme profielklasse | hub-entry binnen kalkrijke satellite |
| tuff | pyroclastisch gesteente | Tufsteen / Tuff | Verkit vulkanisch fragmentmateriaal; porositeit en verwering variëren sterk | hub-entry binnen vulkanische satellite |
| volcanic ash | pyroclastisch materiaal | Vulkanische as / Volcanic ash | Los fijn eruptiemateriaal en mogelijk moedermateriaal; geen synoniem met alle vulkanische bodem | hub-entry binnen vulkanische satellite |
| volcanic parent materials | overkoepelende herkomstfamilie | Vulkanisch moedermateriaal / Volcanic parent materials | Parapluterm voor onder meer basalt, tuf en as; geen enkel bodemtype | independent satellite |
| calcareous vineyard soils | functionele bodemfamilie | Kalkrijke wijngaardbodems / Calcareous vineyard soils | Profielen met relevante carbonaten; verbindt gesteente, pH, voeding, water en wortelstokkeuze zonder alles tot kalksteen te reduceren | independent satellite |

### Bewust niet als synoniemen modelleren

- zand, silt en klei zijn deeltjesfracties; leem is een textuurklasse;
- grind is een grove fractie of afzetting, alluvium een wijze van afzetting;
- kalksteen, krijt en mergel zijn verwant maar niet uitwisselbaar;
- schalie, leisteen en schist vertegenwoordigen verschillende gesteenten en
  omzettingsgraden;
- basalt, tufsteen en vulkanische as horen bij een vulkanische familie maar
  leveren geen uniforme “vulkanische bodem”; en
- minerale nutriënten, geologische mineralen, in wijn gemeten elementen en de
  sensorische term *minerality* zijn vier verschillende begrippen.

## Entitybesluit voor `DEC-EXP-003`

### Aanbevolen independent satellites

1. **`concept.calcareous-vineyard-soils` — Kalkrijke wijngaardbodems / Calcareous vineyard soils.**
   Dit onderwerp slaagt voor de satellite-toets door zelfstandige zoekvraag,
   wereldwijd hergebruik, eigen chemie en wortelstokafwegingen, meerdere
   regionale toepassingen en een eigen mythefamilie rond kalk, zuur en
   “kalkachtige” smaak.
2. **`concept.volcanic-vineyard-soils` — Vulkanische wijngaardbodems / Volcanic vineyard soils.**
   De publieke naam blijft herkenbaar; de pagina legt uit dat het om uiteenlopende
   moedermaterialen, verwering en profielen gaat. Het onderwerp slaagt door hoge
   zoekwaarde, wereldwijde regioverbindingen, sterke marketingclaims en de noodzaak
   basalt, tuf en as uit elkaar te houden.

### Hub-owned entries

Alle overige genormaliseerde termen blijven voorlopig directory-entry. Hun
hoofduitleg past in het gemeenschappelijke vergelijkingsmodel, terwijl een
zelfstandige pagina nu vooral herhaling zou produceren. Een entry kan later
worden gepromoveerd wanneer zoekgedrag, nieuwe regio's of een eigen
onderhoudscyclus dat aantonen; de hub houdt dan een korte definitie en link.

### Uitgesteld naar een andere owner

- Een zelfstandige entity voor **minerality** wordt niet in dit ticket gemaakt.
  De bodemhub corrigeert de directe steen-naar-smaakroute; de volledige
  sensorische term en perceptie horen bij `EXP-025`.
- **Bodemgezondheid**, **bodemleven**, **cover crops**, **bemesting**,
  **erosiebeheer** en **verdichting als beheerprobleem** krijgen hier voldoende
  context om de bodem te begrijpen, maar hun beslis- en beheerlaag hoort bij
  `EXP-013` en `EXP-015`.
- **Onderstamkeuze** linkt naar `concept.rootstock`; de kalkrijke satellite mag
  de bodemreden uitleggen maar kopieert geen complete onderstampagina.

## Lezersvragen en coverage

| Coverage key | Lezersvragen | On-page / target / buiten scope | Reden |
| --- | --- | --- | --- |
| `identity-and-scope` | Wat is een bodemprofiel, en hoe verschillen bodem, ondergrond, moedermateriaal en vast gesteente? | on-page | Zonder dit onderscheid wordt de directory geologisch misleidend |
| `system-components-and-relationships` | Wat ontmoeten wortels werkelijk: vaste deeltjes, poriën, water, lucht, warmte, opgeloste stoffen en organismen? | on-page | Dit is de gezamenlijke ruggengraat van alle vergelijkingen |
| `mechanisms-and-interactions` | Hoe werken textuur, structuur, diepte, water, zuurstof, temperatuur, pH, voeding en biologie samen? | on-page, met links naar waterhub en rootstock | Eigenschappen werken als systeem, niet als losse smaakknoppen |
| `conditions-and-variation` | Waarom gedraagt dezelfde bodemnaam zich anders met profiel, klimaat, seizoen, ras, onderstam en beheer? | on-page | Begrenzing voorkomt universele bodemrecepten |
| `decisions-and-trade-offs` | Wat kan een teler meten of veranderen, en welke eigenschappen zijn grotendeels gegeven? | on-page; beheer verdiept in `EXP-013/015` | De hub moet statische geologie en levende bodem verbinden |
| `global-context-and-examples` | Welke plekken tonen verschillende routes zonder één beroemde regio als norm te gebruiken? | on-page na gerichte broncontrole in `EXP-011` | Voorbeelden dienen het mechanisme, niet de reputatie |
| `evidence-and-limits` | Welke bodemclaims zijn aannemelijk, meetbaar, contextafhankelijk of onbewezen? | on-page; minerality verdiept in `EXP-025` | Dit is een hoofdreden voor de pagina |
| `practical-interpretation` | Hoe lees je een regionale bodembeschrijving, profiel, foto of etiketclaim kritisch? | on-page | De lezer krijgt een herbruikbare beoordelingsmethode |

## Tweetalige sectie-outline en kennisdiepte

| Block-ID | H2/H3 NL | H2/H3 EN | Coverage | Kernidee | Depth en reden |
| --- | --- | --- | --- | --- | --- |
| `orientatie` | — | — | identity-and-scope | Een wijngaardbodem is een profiel en leefomgeving, geen smaaketiket | foundation |
| `overzicht` | Overzicht — van oppervlak tot gesteente | Overview — from surface to bedrock | identity-and-scope | Bodem, ondergrond, moedermateriaal en bedrock krijgen heldere grenzen | foundation; noodzakelijke woordenschat |
| `opbouw-en-samenhang` | Opbouw en samenhang — vaste delen, poriën en leven | Structure and relationships — solids, pores and life | system-components-and-relationships | Wortels leven in een driedimensionaal volume van vaste stof, water, lucht en organismen | foundation |
| `profiel-in-beeld` | **Een bodemprofiel als wortelomgeving** | **A soil profile as a root environment** | system-components-and-relationships | Genummerde profielplaat verklaart horizonten, poriën, wortels en begrenzende lagen | figure |
| `termen-op-hun-plek` | Termen op hun plek | Putting the terms in their place | identity-and-scope | Deeltje, textuur, afzetting, gesteente en bodemnaam zijn verschillende categorieën | intermediate; corrigeert bekende maar subtiele verwarring |
| `werking` | Werking — water, lucht, warmte en beworteling | How it works — water, air, heat and rooting | mechanisms-and-interactions | Dezelfde fysieke velden verbinden bodem met plantreactie | foundation met intermediate detail |
| `water-in-porien` | Water vasthouden is meer dan “zwaar” of “licht” | Water storage is more than “heavy” or “light” | mechanisms-and-interactions | Plantbeschikbaar water hangt van porieverdeling, diepte, steen, structuur en wortels af | intermediate |
| `chemie-en-voeding` | Chemie en voeding — beschikbaarheid boven voorraad | Chemistry and nutrition — availability before abundance | mechanisms-and-interactions | pH, water, binding en wortelselectie bepalen mee wat opneembaar is | intermediate |
| `levende-bodem` | De levende en veranderlijke bodem | The living and changing soil | mechanisms-and-interactions / decisions-and-trade-offs | Organische stof, organismen en beheer beïnvloeden functies binnen inherente grenzen | advanced; evidence en causaliteit zijn complex |
| `omstandigheden-en-variatie` | Omstandigheden en variatie — dezelfde naam, ander profiel | Conditions and variation — the same name, a different profile | conditions-and-variation | Naam alleen voorspelt geen structuur, diepte, water of wortelreactie | foundation |
| `eigenschappen-vergelijken` | Bodemfamilies vergelijken met één meetlat | Comparing soil families with one framework | conditions-and-variation | Alle directorytermen gebruiken dezelfde tien velden | intermediate |
| `keuzes-en-afwegingen` | Keuzes en afwegingen — meten vóór ingrijpen | Decisions and trade-offs — measure before intervening | decisions-and-trade-offs | Diagnose scheidt inherente eigenschap, seizoentoestand en beheereffect | intermediate |
| `wereldwijde-context` | Wereldwijde context — verschillende routes naar een wortelomgeving | Global context — different routes to a root environment | global-context-and-examples | Voorbeelden tonen functies en grenzen, geen ranglijst | intermediate |
| `bewijs-en-grenzen` | Bewijs en grenzen — wat bodemclaims werkelijk zeggen | Evidence and limits — what soil claims actually say | evidence-and-limits | Vervang directe aroma- en kwaliteitsclaims door toetsbare causale ketens | foundation met advanced detail |
| `gesteente-en-smaak` | Van gesteente naar proefwoord: waar de keten breekt | From rock to tasting word: where the chain breaks | evidence-and-limits | Geologische mineralen, nutriënten, wijnelementen en minerality worden gescheiden | advanced |
| `bodemtypen-van-a-tot-z` | Bodem- en gesteentetermen van A tot Z | Soil and rock terms from A to Z | system-components-and-relationships / conditions-and-variation | Beeldrijke alfabetische directory met categorie, werking, grens en eventuele satellite-link | foundation; scanbare naslag |
| `betekenis-voor-wijn` | Betekenis voor wijn — betere vragen bij iedere bodemclaim | Significance for wine — better questions for every soil claim | practical-interpretation | Vraag naar profiel, eigenschap, plantreactie, seizoen en beheer | foundation |
| `centraal-inzicht` | — | — | practical-interpretation | Bodem stuurt groeivoorwaarden via eigenschappen en interacties; hij dicteert geen proefnotitie | key idea, foundation |

## Wereldwijde voorbeeldmatrix voor `EXP-011`

Deze plekken zijn onderzoekskandidaten, geen reeds ondersteunde claims. Iedere
opname vereist een geschikte lokale bron en mag alleen de genoemde leestaak
dragen.

| Kandidaat | Variatie of grens | Waarom kandidaat? | Controle tegen regionale overweging |
| --- | --- | --- | --- |
| Médoc | grindrijk profiel, drainage en waterreserve | sluit aan op bestaande content en toont waarom “grind” zonder matrix en diepte incompleet is | Bordeaux krijgt maximaal één functievoorbeeld |
| Mosel | leisteen, verwering, helling en dun profiel | scheidt gesteentenaam van volledig bodem- en klimaatverhaal | niet gebruiken als universele leisteenuitkomst |
| Coonawarra | terra rossa boven carbonaatmateriaal | toont bodemnaam, profielopbouw en waterbeheer | lokale definitie en schaal expliciet brongebonden |
| Canarische Eilanden | meerdere vulkanische materialen en waterbehoud | doorbreekt “vulkanische bodem” als één type | geen rook- of asaroma suggereren |
| Santorini | vulkanisch materiaal, droogte en bijzondere wortelomgeving | contrasteert met vochtiger vulkanische context | water, wind en training niet aan bodem toeschrijven |
| Jerez | kalkrijk materiaal en uitgesproken seizoenswaterbalans | toont carbonaten en wateropslag zonder kalksmaakclaim | kelderstijl buiten de bodemclaim houden |
| Barossa of McLaren Vale | oude, intern gevarieerde profielen | laat zien dat regionale bodemlabels mosaïeken samenvatten | geen “oude bodem = betere wijn” |
| Marlborough of Napa | profielkartering en verschillen binnen één wijngaard | toont schaal, bemonstering en beheer | regio alleen opnemen met publieke profieldata |

**Vervangingstest:** het fysische model blijft waar wanneer ieder bekend
regiovoorbeeld wordt vervangen. Geen mechanisme mag van Bordeaux, Mosel,
Santorini of een andere voorbeeldplek afhankelijk zijn.

## Claim- en mythematrix

| Claim of lezersvraag | Evidenceantwoord | Eigenaar/diepte | Sourcebasis | Status voor `EXP-011` |
| --- | --- | --- | --- | --- |
| “Je proeft kalksteen, vuursteen of leisteen rechtstreeks in wijn.” | De letterlijke route van geologisch mineraal naar gelijknamige smaak wordt niet gedragen; minerality is een variabel sensorisch begrip met meerdere mogelijke wijnchemische en perceptuele associaties | evidence-and-limits, foundation + advanced | Maltman; Parr et al. | supported |
| “Mineralen uit gesteente gaan rechtstreeks de druif en wijn in.” | Planten nemen opgeloste elementen selectief op; beschikbaarheid, water, worteloppervlak en fysiologische regulatie scheiden gesteentemineralen van elementen in wijn | mechanisms / evidence, intermediate | Maltman; White; Oliver | supported |
| “Kalksteen maakt wijn zuurder of kalkachtig.” | Kalkrijke profielen kunnen pH, nutriëntenbeschikbaarheid, beworteling en waterhuishouding beïnvloeden; druifzuur en sensorische indruk ontstaan via meerdere plant-, seizoen- en kelderroutes | calcareous satellite + hub caveat | van Leeuwen; Oliver; gerichte satellitebronnen nog nodig | partial; add targeted research |
| “Vulkanische bodem geeft rokerige of minerale wijn.” | Vulkanisch verwijst naar uiteenlopende moedermaterialen en profielen; een gedeelde aroma-uitkomst volgt niet uit basalt, tuf of as | volcanic satellite + hub caveat | Maltman; USGS; gerichte satellitebronnen nog nodig | partial; add targeted research |
| “Arme bodem levert betere wijn.” | Definieer arm: water, stikstof, ander nutriënt, organische stof of bewortelbaar volume. Zowel tekort als overmaat kan groei en druifuitkomst verstoren; doel en context bepalen de beoordeling | evidence-and-limits, foundation | van Leeuwen; Lazcano; White | supported |
| “Hoe dieper de wortels, hoe sterker het terroir.” | Effectief wortelvolume en toegang tot water/nutriënten zijn relevant, maar beworteling volgt profiel, ras, onderstam, leeftijd, beheer en seizoen; diepte alleen is geen kwaliteitsmaat | structure / variation, intermediate | Cornell; White; NRCS | supported |
| “Goede drainage is altijd beter.” | Drainage en beluchting helpen tegen langdurige verzadiging, terwijl te snelle afvoer en geringe opslag het tekort kunnen versnellen; profiel en klimaat bepalen de balans | mechanisms, foundation | NRCS; van Leeuwen; waterhub | supported |
| “Klei houdt altijd het meeste bruikbare water vast.” | Fijne poriën houden veel water, maar een groter deel kan sterk gebonden en dus niet plantbeschikbaar zijn; aggregatie, diepte, compactie en wortels veranderen de uitkomst | mechanisms, intermediate | NRCS available water capacity | supported |
| “Een bodemfoto of losse steen vertelt het terroir.” | Een foto kan kleur, fragmenten en structuur tonen; profiel, schaal, diepte, seizoentoestand, chemie en metingen blijven nodig voor functionele uitspraken | practical interpretation, foundation | White; NRCS | supported |
| “Bodemleven gaat rechtstreeks mee de wijn in en bepaalt de smaak.” | Bodemorganismen ondersteunen functies en er zijn microbiële verbindingen onderzocht, maar een stabiele, algemeen geldige route van specifiek bodemmicrobioom naar herkenbare wijnsmaak is nog niet bewezen | living soil, advanced | Lazcano; White | supported as uncertainty |
| “Oude bodems zijn betere bodems.” | Geologische ouderdom en actuele bodemfunctie zijn verschillende vragen; structuur, verwering, profiel, klimaat en beheer bepalen de huidige wortelomgeving | overview / evidence, foundation | Maltman; White | supported |
| “Bodemtype alleen verklaart regionale wijnstijl.” | Bodem werkt samen met klimaat, topografie, plantmateriaal, seizoen en beheer; regionale stijl vraagt een meervoudige verklaring | practical interpretation, foundation | van Leeuwen; White | supported |

## Dependency- en begrippenplan

| Kandidaat | Besluit | Canonical owner / target | Nodig vóór publicatie? |
| --- | --- | --- | --- |
| waterstatus, deficit en waterverzadiging | hergebruik | `concept.vine-water-relations` | ja, link |
| klimaat, weer, site en microklimaat | hergebruik | `concept.climate-weather-site-microclimate` | ja, link |
| wijnstok als levend systeem | hergebruik | `concept.vine-as-living-system` | ja, link |
| wortelstokkeuze | hergebruik | `concept.rootstock` | ja, link |
| terroir | hergebruik | `concept.terroir` | ja, link |
| kalkrijke wijngaardbodems | satellite na besluit | `concept.calcareous-vineyard-soils` | alleen na `DEC-EXP-003` |
| vulkanische wijngaardbodems | satellite na besluit | `concept.volcanic-vineyard-soils` | alleen na `DEC-EXP-003` |
| minerality | hub behandelt alleen bodemmythe; volledige owner uitgesteld | `EXP-025` | nee |
| bodemgezondheid en bodembeheer | context + toekomstige owner | `EXP-013/015` | nee |
| alle overige A–Z-termen | hub-owned directory-entry | `concept.vineyard-soils#bodemtypen-van-a-tot-z` | ja |

## Visual teaching contract en shot list

### Visual 1 — Een bodemprofiel als wortelomgeving

- **Teaching question:** wat bevindt zich tussen oppervlak en vast gesteente, en
  welke delen kan een wijnstokwortel werkelijk gebruiken?
- **Vorm:** schematisch-naturalistische horizontale doorsnede, taalneutraal,
  rasterbeeld.
- **Verplicht zichtbaar:** oppervlak en begroeiing; meerdere bodemhorizonten;
  grove en fijne deeltjes; grote en kleine poriën met lucht en water; fijne en
  dikke wortels; een verdichte of anderszins beperkende laag; verweerd
  moedermateriaal; vast gesteente; schaalindicatie via plant en profiel.
- **Verboden implicaties:** wortels die standaard meters diep in vast gesteente
  boren; een ondergrondse waterpoel; één universeel horizonprofiel; bergen of
  regionale architectuur; pijlen van steen rechtstreeks naar druif of glas.
- **Vereenvoudiging:** exact acht taalneutrale nummers. De NL/EN-figurebody
  verklaart profiel, poriën, wortels, begrenzing en overgang; tekst staat niet in
  pixels.

### Visual 2 — Dezelfde meetlat voor vier contrasterende profielen

- **Teaching question:** waarom zijn drainage, totale wateropslag en
  plantbeschikbaar water niet hetzelfde?
- **Vorm:** vier gelijkwaardige doorsnedepanelen met identieke afmetingen en
  wijnstokstadium; schematisch-naturalistisch diagram.
- **Verplicht zichtbaar:** grof/zandrijk, goed geaggregeerd leemachtig,
  kleirijk/gestructureerd en stenig-ondiep profiel; relatieve poriegroottes,
  wortelbaar volume, infiltratie en waterverdeling.
- **Verboden implicaties:** rangorde, groene vink, premiumdruiven, exacte
  universele percentages of een “beste” bodem.
- **Vereenvoudiging:** nummers 1–4 en consistente water-/luchtmarkeringen; HTML
  benoemt dat echte profielen mengvormen zijn.

### Fotografische directory

Fotografie heeft voorrang boven gegenereerde illustratie omdat de directory
zichtbare werkelijkheid leert herkennen. Per entry zoekt `EXP-011` eerst een
open-gelicentieerde foto met:

1. bekende locatie en maker;
2. bruikbare schaal (meetlat, hand, profielwand of herkenbare korrelmaat);
3. een profiel of vers materiaal, niet alleen een idyllisch wijngaardpanorama;
4. natuurlijke kleur zonder zware grading;
5. voldoende resolutie voor uitsnede op breed en smal scherm; en
6. caption die categorie en zichtbare kenmerken benoemt zonder water-, smaak- of
   kwaliteitsgedrag uit het beeld alleen af te leiden.

**Prioriteit A — eigen foto gewenst:** alluvium, klei, grind, leem, zand, silt,
terra rossa en een kalkrijk profiel. Textuur en profiel zijn hier de primaire
leertaak.

**Prioriteit B — gesteente plus verweerd profiel:** basalt, krijt, vuursteen,
graniet, kalksteen, mergel, schist, schalie, leisteen, tufsteen en vulkanische
as. Een losse steenfoto mag alleen naast een profiel- of verweringsbeeld staan.

Wanneer geen betrouwbare open foto beschikbaar is, gebruikt de directory geen
gegenereerd beeld als documentaire vervanger. Een zorgvuldig gemarkeerd
educatief detaildiagram kan alleen de vorm of het categorieverschil uitleggen.

## Section completeness gate voor `EXP-011`

Iedere sectie wordt opnieuw beoordeeld op:

- correcte scheiding van bodem, profiel, moedermateriaal en gesteente;
- één consistent fysisch-eigenschappenmodel voor alle directory-items;
- foundationuitleg vóór vaktermen en meetmethoden;
- expliciete route bodem → wortelomgeving → plantreactie, zonder sprong naar
  smaak of kwaliteit;
- onderscheid tussen inherente en beheerbare eigenschappen;
- bronnen op het niveau van de claim en geen wereldregel uit één regionale
  studie;
- gelijkwaardige NL/EN-scope en natuurlijke terminologie;
- fotografie met locatie, schaal, rechten en inhoudelijke nauwkeurigheid; en
- bewuste doorverwijzing naar water, onderstam, klimaat, terroir, beheer en
  perceptie zonder dubbele canonical uitleg.

## Iteratielog

- **Iteratie 1 — terminologie:** de oorspronkelijke lijst bleek meerdere
  ontologische niveaus te mengen. Alle achttien termen zijn daarom ingedeeld als
  fractie, textuur, afzetting, gesteente, moedermateriaal of bodemnaam.
- **Iteratie 2 — causaliteit:** de vergelijking is herschreven rond tien vaste
  eigenschappen en de route naar wortel- en plantreactie. Directe
  gesteente-naar-aromaformuleringen zijn uitgesloten.
- **Iteratie 3 — evidence:** Maltman en Parr et al. dragen de geologische en
  sensorische correctie; van Leeuwen, White, Lazcano, Oliver, NRCS en Cornell
  vullen plantfysiologie, bodemfuncties, water, chemie, biologie en wortels aan.
- **Iteratie 4 — entitygrens:** achttien losse satellieten zouden vooral
  herhaling en een misleidende typologie opleveren. Twee onderwerpen hebben een
  aantoonbaar eigen zoek-, bron- en onderhoudsprofiel; de rest blijft scanbare
  hubinhoud.
- **Iteratie 5 — visualcontract:** echte profiel- en materiaalfoto's krijgen
  voorrang. Diagrammen leggen uitsluitend onzichtbare porie-, water- en
  wortelrelaties uit; geen gegenereerd beeld fungeert als bewijs van een plaats
  of bodemmonster.

## Publication gate

- [x] Alle coveragevragen zijn beantwoord of concreet uitbesteed.
- [x] Ownership en entitygrenzen hebben een gemotiveerd voorstel.
- [x] Foundation is zelfstandig begrijpelijk; hogere dieptes verdiepen echt.
- [x] De voorbeeldmatrix is wereldwijd en functiegedreven opgezet.
- [x] Algemene synthese en specifieke claims hebben een passende bronbasis of
      expliciete research-gap.
- [x] De tweetalige outline draagt dezelfde scope en structuur.
- [x] Visuals hebben een leertaak, feitencontract en toegankelijk alternatief.
- [x] `DEC-EXP-003` keurt de twee satellites en hub-owned directory goed.
- [x] `EXP-011` schrijft, lokaliseert, illustreert, linkt en valideert de
      uiteindelijke packages.
