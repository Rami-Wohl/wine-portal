# Wijngaardlessen, batch 1 — publicatiereview 2026-10-12

Review-ID: `QCR-2026-10-12-04`. Uitvoering: Codex. Scope: `LRN-014`, na
expliciet gebruikersakkoord op het achtlessencurriculum (`DEC-LRN-015`).
Dit is een inhoudelijke en technische review; geen menselijke gebruikerstest,
externe expertgoedkeuring of live deploymentverificatie.

## Resultaat en afbakening

Drie actieve zelfstandige lessons met eigen NL/EN-proza:

| ID | Lesvraag / didactische toepassing |
| --- | --- |
| `narrative.lesson.vine-through-year` | Wat blijft en wat groeit opnieuw? Organen → aanvoer → stadia → volgende seizoen; oefening over vroeg bladverlies en reserveopbouw |
| `narrative.lesson.climate-site-and-season` | Welke omgevingsinformatie past bij een beslissing? Tijd/schaal → mechanismen → fictieve plekken A/B → passende meetcontext vóór bladbeheer |
| `narrative.lesson.soil-roots-and-water` | Kan de plant opgeslagen water benutten? Voorraad/toegang → route → plantreactie/zuurstof → fictieve compactielaag en onderzoeksvolgorde |

Alle leerdoelen, bronnen, block-IDs, dieptes, volgorde en media zijn gelijkwaardig
in beide talen. De oefeningen geven een beredeneerd antwoord zonder score of
beheersingsclaim. Begrippen zijn bij eerste gebruik uitgelegd. Naslagowners zijn
behouden; er is geen gekopieerde overzichtspagina als lessonstep gebruikt.
Geen nieuwe entities, bronnen, mediabytes, appcomponenten of schemawijzigingen.

De lessen verschijnen door bestaande afleiding in Learn onder losse lessen,
Verdiepingen, zoeken, sitemap en relevante entityteruglinks. Ze behoren nog niet
tot een actief wijngaardpath. Ook een handmatig toegevoegde query voor het
bestaande stille-wijnpad geeft hun geen onterechte pathcontext of voortgang.

## Bron- en claimreview

Tien bestaande bronrecords zijn op 2026-10-12 opnieuw geraadpleegd; de
`accessed_at`-datums zijn bijgewerkt. De artikelen bewaren citaties; deze review
is geen tweede feitenbron.

| Claimfamilie | Geraadpleegde bronnen en controlegrens |
| --- | --- |
| Wortels, opname, opslag en plantverbinding | `source.cornell-grapevine-roots`; Cornell-uitleg gelezen, geen universele worteldiepte |
| Knoppen en de twee-seizoenenontwikkeling | `source.cornell-grapevine-flowers`; geen vaste bloemen-/opbrengstaantallen |
| Jaarontwikkeling en bladfunctie | `source.nmsu-grapevine-phenology`; regionale data, temperatuurgrenzen en algemene daglengteclaims weggelaten |
| Herkenbare ontwikkelingsstadia | `source.awri-grapevine-growth-stages`; PDF gecontroleerd, véraison als begin van rijping |
| Koolstofreserves en variatie | `source.pellegrino-vine-carbohydrate-status-2014`; volledige publishertekst via Frontiers, geen proefeffect als universeel resultaat |
| Klimaatnormalen | `source.wmo-climatological-normals`; standaardperiode gecontroleerd, geen verzonnen plaatsdata |
| Canopy- versus stationlucht | `source.pena-vineyard-canopy-temperature-2020`; volledige PLOS-tekst, geen vaste correctiefactor uit één proef |
| Waterroute, huidmondjes en droogtereactie | `source.gambetta-grapevine-drought-physiology-2020`; open volledige tekst via NCBI/PMC-zoekindex beschikbaar; directe DOI/publisheropen gaf een toolfout en de PMC-pagina een browsercontrole; geen grenswaarden of rasrangschikking overgenomen |
| Poriën, wateropslag, wortelbeperking | `source.nrcs-available-water-capacity`; PDF, opslag onderscheiden van bruikbaarheid; klei niet als maximale beschikbaarheid gepresenteerd |
| Verzadiging en zuurstof | `source.awri-waterlogged-vineyards`; PDF, duur en profielcontext behouden; geen drainage-/irrigatierecept |

De drie casussen zijn expliciet hypothetisch en kwalitatief. Geen echte
locatie, geografie, klimaatgetal, opbrengst, irrigatiedosis of directe
bodem-/weersmaakrelatie toegevoegd. De glasblokken volgen de keten via druiven,
oogst en wijnmaken. Positieve uitleg draagt de lessen; begrenzingen staan bij de
concrete misinterpretatie die zij voorkomen.

## Beeld- en taalreview

De drie bestaande PNG's zijn zelfstandig visueel bekeken: anatomie (markers
1–8), environmental-scales (1–4) en waterroute (1–6). Organaanduidingen,
zoomvolgorde, wortelopname en waterroute passen bij de hierboven genoemde
bronnen. De gelokaliseerde legenda's verklaren alle markers in gewone tekst.
Bloei plus rijpe trossen als samengestelde plaat, generieke landschapsidentiteit,
schematische worteldiepte/pijlen en mogelijke druppeltoevoer zijn begrensd in
de tekst. De afbeelding draagt geen verborgen essentieel feit of behandeladvies.

NL/EN zijn naast elkaar beoordeeld op claims, toepasbaarheid, jargon en
figuurtekst. De contentvalidator controleert structurele parity. Nieuwe
linkauditkandidaten in de klimaatles zijn beoordeeld en passende links naar
Chardonnay, extractie en élevage zijn aangebracht. Na die correctie zijn er
geen ongekoppelde naamkandidaten in deze drie lessons. De bestaande globale
new/pending-queues zijn niet stilzwijgend als afgehandeld gemarkeerd.

## Verificatie

- `npm run content:check`: geldig, **359 entities, 11 narratives, 1 path,
  612 sources, 188 media**. Tien lessons actief; één regionale narrative draft.
- `npm run format` en `npm run check`: formatting, ESLint, contentbuild,
  relationele audit van **295 actieve entities**, Next-typegeneratie,
  TypeScript en **184 unit-tests in 24 bestanden** geslaagd.
- Productiebuild via `npm run test:e2e` / `next build --webpack` geslaagd.
  De eerste browsertestrun signaleerde testaannames over geoptimaliseerde
  afbeeldings-URL's, no-JS-loadmoment en ingeklapte teruglinks. Testcode
  gecorrigeerd; geen runtimeprobleem met een workaround gemaskeerd.
- Finale volledige run `npx playwright test --workers=4`: **171/171 geslaagd**,
  inclusief tien nieuwe tests. Alle zes gelokaliseerde lespagina's op
  **320 en 1440px**, geladen PNG's en markerlegenda's, geen horizontale overflow;
  heen/terug naar naslag, Learn/Verdiepingen/zoeken, toetsenbordactivatie,
  taalwisseling met gedeeld anker, zes permanente aliasredirects en beide
  talen zonder JavaScript met geladen afbeeldingen gecontroleerd.
- Visuele browsersteekproef op **390 en 1440px**: NL-wijnstokles op desktop,
  NL-klimaatles inclusief figuurlegenda op mobiel, EN-waterles inclusief
  figuurlegenda op mobiel en EN-klimaatles op desktop. Titels, tekstkolom,
  leerdoelen, contextzijbalk en genummerde legendatekst zijn leesbaar.
- Sitemap-/metadata-unit-tests nemen de nieuwe packages automatisch mee.
  Linkaudit is read-only uitgevoerd; geen brede baseline-sync of andere
  publicatiebatch meeveranderd. Geen nieuwe performance-/platformcode;
  de schaalbenchmark is daarom niet opnieuw uitgevoerd.

## Vervolg

`LRN-014` afgerond. `LRN-015` is de volgende taak: snoei/loofwand/gewasbelasting,
voeding/wijngaardvloer en risico/bescherming. Extra aandacht voor observatie
versus diagnose en voor contextafhankelijke ingrepen; curriculumakkoord hoeft
niet opnieuw. `LRN-016` levert de laatste twee lessen, `LRN-017` integreert het
volledige path. Er zijn geen nieuwe blockers of onderhoudstickets gevonden.
De productplanning telt **61** resterende tickets; Atlas, naslag en geparkeerd
feedbackwerk behouden hun bestaande positie en besluitpoorten.
