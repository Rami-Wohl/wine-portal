# Integratie Explore-basis — 2026-10-14

Review-ID: `QCR-2026-10-14-01`
Scope en publicatiegate: [EXP-026-brief](briefs/exp-026-integration.md).

## Reikwijdte en methode

86 actieve packages en 172 gelokaliseerde documenten: 68 foundationconcepts,
Port/Sherry/Champagne en alle vijftien lessen. De acht handels-/producententermen
claret, courtier, en primeur, grand vin, négociant, Place de Bordeaux, second wine
en estate bottling vallen buiten deze foundationselectie. Regio's dienen als
instap in de actieve graaf; regionale drafts worden niet gepubliceerd.

De gevalideerde contentbundle is onderzocht op blockstructuur, kennisdiepte,
entitytargets, citations, media, actieve verbindingen en ongekoppelde namen.
De controle vergelijkt gedeelde IDs, niet woordelijke vertaling. De bestaande
EXP-016-ownerbesluiten en het publicatierapport van EXP-023 zijn opnieuw getoetst.
Dit is een integratiereview, geen nieuwe volledige claim-, wetgevings- of
licentiereview van het gehele corpus. Nieuwe feitelijke uitleg is wel tegen
geopende primaire bronnen gecontroleerd.

## Uitkomst

| Controle binnen scope | Uitkomst |
| --- | ---: |
| Blocks per structurele taalspiegel | 1.025 |
| Verschillen in blocktype, ID, depth, parent, media en source_refs | 0 |
| Verschillen in entitytargets en aangehaalde sources tussen NL/EN | 0 |
| Packages zonder actieve verbinding of route vanuit regio-/lessoncontent | 0 |
| Figuregebruik per taal | 112 |
| Unieke gebruikte mediarecords | 87 |
| Daarvan SVG | 1; migratie blijft MNT-053 |
| Canonical draftmentions | 64, naar 24 bestemmingen; publieke tekst behouden, geen draftlinks |
| Onbeoordeelde linkkandidaten binnen scope | 0 |

Alle foundationconcepts hebben een passende rol. We slaan geen dubbele
spiegelrelaties op om aantallen te verhogen: inverse relaties zijn al afgeleid.
De twee leerpaden, hun steps, doelen en opgeslagen browservoortgang veranderen niet.

## Rollen van alle foundationconcepts

Onderstaande suffixen horen bij `concept.`. De groepen zijn een inventaris
van verantwoordelijkheden voor deze review, geen nieuwe runtime-taxonomie.
Elk concept komt eenmaal voor; kleine satellites blijven gekoppeld aan hun systeemhub.

| Rol | Canonical suffixen |
| --- | --- |
| Plant, ontwikkeling en teelt — 16 | ampelography; berry-development-ripeness; clonal-selection; coulure; flowering-fruit-set-yield; franc-de-pied; grapevine-phenology; millerandage; phylloxera; pruning-training-canopy-crop-load; rootstock; vine-as-living-system; vine-nutrition-soil-management-vineyard-floor; vine-water-relations; vineyard-hazards-diseases-pests-disorders; vineyard-systems-sustainability-adaptation |
| Omgeving en bodem — 5 | calcareous-vineyard-soils; climate-weather-site-microclimate; terroir; vineyard-soils; volcanic-vineyard-soils |
| Kelderroute en handelingen — 18 | assemblage; autolysis; batonnage; bottling; carbonic-maceration; cellar-hygiene-wine-faults; clarification-and-fining; elevage; extraction; fermentation; grape-reception-must-preparation; lees-ageing; maceration; malolactic-fermentation; oxidation; pressing; sulfur-dioxide; winemaking-routes |
| Samenstelling en ervaring — 6 | acidity; methoxypyrazines; tannin; volatile-thiols; wine-composition; wine-perception-and-development |
| Wijnfamilies en hun specifieke routes — 17 | appassimento; botrytis; disgorgement; dosage; fortification; fortified-wines; late-harvest; liqueur-de-tirage; passerillage; passito; remuage; second-fermentation; sparkling-wines; spatlese; sweet-wines; traditional-method; vin-de-paille |
| Herkomst-/etiketbegrippen — 6 | aop; chateau; clairet; cru; cuvee; vintage |

De drie appellations zijn concrete beschermde wijnnamen. De zeven stille-wijnlessen
en acht wijngaardlessen zijn consumers: zij oefenen de redenering en gebruiken
de owners als naslag; geen les wordt een tweede canonical feitenowner.

## Ownership en vindbaarheid

| Onderwerp | Canonical eigenaar | Integratiebesluit |
| --- | --- | --- |
| Klimaatclassificaties | `concept.climate-weather-site-microclimate#klimaatklassen-en-indices` | Korte basisoriëntatie; intermediate onderscheid Köppen-Geiger versus Winkler/Huglin; geen nieuwe kaart of dunne classificatieentity |
| Aroma-oorsprong | `concept.wine-composition#aroma-oorsprong` | Basisoriëntatie en intermediate proefkader; WSET rekent druif én alcoholische vergisting tot primair, postfermentatieve wijnbereiding tot secundair, rijpingsontwikkeling tot tertiair |
| Waarneming en flesontwikkeling | `concept.wine-perception-and-development` | Houdt eigen scope; contextuele verwijzing naar de aroma-owner, geen tweede aromachemisch overzicht |
| Eikenhout, vaten en toast | `concept.elevage#vatkeuze` / `#maat-leeftijd-en-toast` | Bestaande uitleg behouden; kop noemt nu eikenhout/oak zodat de owner ook via dit trefwoord vindbaar is |
| Stille wijn | `concept.winemaking-routes#overzicht` | Betekenis expliciet, onderscheiden van droogheid en volledige afwezigheid van opgelost CO₂; kop draagt de categorie, families houden hun eigen routes |
| Specifieke wijnnamen | `appellation.port`, `appellation.sherry`, `appellation.champagne` | Naam/specifieke regels blijven bij de appellation; suiker, gas en versterking bij de familie; kelderhandelingen bij procesowners |

Nieuwe sources zijn Peel/Finlayson/McMahon (2007), OIV-VITI 423-2012 en het
WSET Level 3 Wine-Lexicon (2016). Bestaande OIV-klimaatvariabiliteit, WSET-tastingguide,
AWRI-gasbeheer en AWRI-aromavoorlopers zijn opnieuw geopend. Geen numerieke
wereldwijde definitie van stille wijn of regionale klimaatgrens toegevoegd.
Geen keywordaliases: daadwerkelijk geschreven koppen en passages dragen de zoekresultaten.

## Contextuele verwijzingen en triage

De oorspronkelijke selectie bevatte 269 kandidaatvermeldingen. Daarvan zijn
85 opgelost door gerichte, gelijke NL/EN-verwijzingen. De overgebleven 184 zijn
178 gemotiveerde skips en zes false positives. Het register bewaart ook de
opgeloste kandidaten en de drie eerdere phenologybesluiten. Geen andere
corpusdelen zijn in bulk afgetekend.

Voorbeelden van toegevoegde routes:

- Cuvée, cru, AOP, assemblage, vergisting, autolyse, liescontact, tirage en
  jaargang verwijzen naar de actieve Champagnepagina waar die wijn wordt bedoeld.
- Liescontact verbindt tweede vergisting, remuage, autolyse en samenstelling;
  oxidatie en bâtonnage verbinden de relevante procesowners.
- De grondstofles verwijst direct naar besrijpheid en het plantsysteem;
  de MLF-/liesles en opvoedingsles verwijzen naar samenstelling.
- Wijnsamenstelling verwijst naar vatkeuze, aromaontwikkeling, autolyse,
  assemblage, persen en het actieve Sauvignon-Blancvoorbeeld.
- Het bodemvoorbeeld verwijst naar de actieve Médocowner.

Cuvée had nog een EN-only jaarganglink; die is nu ook in NL aanwezig. De vijf
EXP-016-verschillen waren al opgelost en zijn bevestigd.

Niet iedere genoemde handeling wordt een extra link. Recaps behouden hun
leerfunctie, beschreven zijstappen hun context. “Port” als haven en “extraction”
als bodemanalytische methode zijn false positives. “Vintage” als Portcategorie
wordt niet gelijkgesteld aan de jaargangentity. De regionale Champagneowner
blijft onderscheiden van de beschermde wijn, ook wanneer dezelfde naam voorkomt.

De volledige corpusqueue bevat na de ronde 1.025 kandidaten: 104 nieuw,
737 pending en de 184 beoordeelde foundationkandidaten. Die 841 buiten scope
zijn een redactionele voorraad, geen 841 fouten of automatisch noodzakelijke
links. Regionale/druivenbestemmingen worden meegenomen bij REG-003 en hun eigen
publicatiebatches; overige regionale-/producentenproza krijgt contextuele triage
bij revisie. [Register](link-audit-decisions.yaml).

## Canonical mentions en publieke navigatie

`MNT-068` sluit de resterende renderergrens na MNT-067. Inline entitylinks naar
niet-actieve entities worden gewone, gelokaliseerde tekst. Een auteurslabel en
omliggende nadruk blijven intact. Canonical Markdown, mentions, backlinks en
future dependencies worden behouden; na activering wordt dezelfde mention weer
een link. Directe draftreviewroutes en noindex behouden hun bestaande contract.

`MNT-069` herstelt een afzonderlijke visuele bevinding: bij een directe URL kon
het juiste verdiepingsblok zichtbaar worden terwijl de lezer bovenaan bleef.
Native fragmentscrolling vond plaats terwijl hydration het blok nog verborg.
De kennishook herhaalt de scroll nadat de fragmentgestuurde inhoud is onthuld;
handmatige dieptekeuzes veroorzaken geen nieuwe scroll. Browsercases toetsen
nu ook de daadwerkelijke positie bij rechtstreeks openen en herladen.

## Verificatie

- Format, volledige projectcheck, typecheck en relationele corpusaudit: 192 unit-tests geslaagd.
- Productiebuild: geslaagd, met dezelfde canonical route-inventaris.
- Volledige Chromium-suite: 205/205 geslaagd, twee workers, nul retries.
- Browserchecks toetsen search/deepanchors, directe fragmenten en reload,
  les-/ownervervolg, leesbare drafttekst, bestaande routes/progressie, no-JS en
  responsive gedrag. De nieuwe integratiecases meten 320, 768 en 1.440 pixels.
- Visueel: Nederlandse klimaatpassage op 1.440 pixels en Engelse aromapassage
  op 320 pixels beoordeeld; geen paginaoverflow. De fragmenten landen op circa
  206 pixels onder de viewporttop, onder de vaste header. De aromavergelijking
  gebruikt leesbare bullets. Tijdelijke viewportoverride en browsertab opgeruimd.
- Finale productiepreview staat weer op `http://127.0.0.1:3101`.

De build houdt 981 prerendered pagina's. De repository bevat 372 entities
(298 active, 74 draft), 16 narratives, twee learning paths, 633 sources en
190 mediarecords. De ronde breidt bestaande uitleg uit; er zijn geen nieuwe
concept-/wijnpagina's, lessen of beelden gepubliceerd.

De eerste browserronde signaleerde oude verwachtingen voor Tokaj-/Amarone-draftlinks,
verkeerde canonical slugs in de nieuwe tests en selectors die maar één verwijzing
naar een owner toelieten. Deze tests controleren nu leesbare drafttekst, de
werkelijke publieke routes en zichtbare vervolgverwijzingen. De zoekcontrole
bracht de ontbrekende oak-term in de kop van vatkeuze aan het licht; die kop is
in beide talen verduidelijkt, evenals de kop voor stille wijn. De mobiele visuele
controle bracht onhandige woordafbreking in de nieuwe aromatabel aan het licht.
Dezelfde vergelijking staat nu als drie korte bullets, volledig leesbaar zonder
een horizontale tabelbeweging.

## Vervolg

Actuele status staat in de domeinbacklogs. Mondiale claimstress blijft EXP-027;
integrale product/publicatie-QA EXP-028. MNT-053 behoudt de bestaande SVG-migratie;
REG-003 plant brede wetgeving, genetica, aanleg, oogst en regionale/druivencontent.
De resterende EXP-032-catalogusbatches volgen na EXP-028. Eerstvolgend is de
geverifieerde Atlasafbakening MNT-051; daarmee is geen volledige kaartbouw gestart.
