# Wijnstok en wijngaard — integrale publicatiereview 2026-10-13

Review-ID: `QCR-2026-10-13-01`. Uitvoering: Codex. Scope: `LRN-017`, volgens
het goedgekeurde curriculum (`DEC-LRN-015`). Redactionele integratie en lokale
productie-/browsercontrole; geen menselijke gebruikerstest, externe
expertgoedkeuring of verificatie van een live deployment.

## Publicatie en inhoudelijke samenhang

Actief package `learning-path.vine-and-vineyard`, canonical slug
`vine-and-vineyard`, NL-alias `wijnstok-en-wijngaard`. Het pad heeft acht stabiele
steps, niveau `understand`, zes leerdoelen, acht recapitems en vier actieve
vervolgtargets. Pathtekst is kort structureel proza in YAML; wijnuitleg blijft
bij de bestaande lesson- en entityowners.

De integrale review vergelijkt de NL/EN-uitleg, leerdoelen, toepassingen,
glas-koppelingen en naslag met de curriculumbrief:

| Les | Bijdrage aan de leerboog en overgang |
| --- | --- |
| Wijnstok door het jaar | Organen, nieuwe/blijvende groei en jaarcyclus leveren de woordenschat; knoppen/reserves verbinden jaren |
| Klimaat, weer en plek | Voegt tijdsvenster en ruimtelijke schaal toe; lokale tros-/bladomgeving verbindt aan de waterroute |
| Bodem, wortels en water | Onderscheidt voorraad, bereikbaarheid en plantrespons; herneemt xyleem/huidmondjes waar nodig voor zelfstandigheid |
| Snoei, loofwand en gewasbelasting | Verbindt bovengrondse ingrepen met orgaan, fase en capaciteit; microklimaat wordt een concrete beheerafweging |
| Voeding en wijngaardvloer | Verbindt opname en groei met een interpreteerbare meting; bedekking brengt bodemfunctie en concurrentie samen |
| Risico en bescherming | Verbindt eerdere groeiverklaringen met symptoom, hypothese en nacontrole; natte wortelzone is een toepassing, geen tweede waterles |
| Rijpheid en oogst | Brengt seizoen, gezondheid en meerdere waarnemingen samen; veldbeslissing blijft onderscheiden van de bestaande keldergerichte grondstofles |
| Teeltsystemen en aanpassen | Verbindt individuele keuzes over meerdere seizoenen; praktijk/controle/resultaat en de zesdelige toepassing vormen de inhoudelijke afsluiting |

Herhaling van plantfunctie, waarneming en de fruit–kelderketen is functioneel:
iedere les blijft zelfstandig, terwijl de toepassing complexer wordt. Het pad
voegt bij iedere stap kort toe waarom die nu volgt. Recapitems verwijzen naar
de acht behandelde leeropbrengsten; de afsluiting claimt geen examen, beheersing
of certificering. Persoonlijke voltooiing volgt uitsluitend uit expliciete
lokale lesmarkeringen. De oorspronkelijke grondstofles blijft keldergericht.

Vervolgsuggesties: het actieve stille-wijnpad, terroir, rijpheid en teeltsystemen.
Targets, titels en locale-aware routes worden uit canonical records afgeleid.
Geen afhankelijkheid van draftcontent, ontbrekende Atlasdata of individuele
wijnpagina's. Bredere aanleg-/oogst-/catalogusgaten blijven bij REG-003/EXP-032.

## Provenance, beelden en grenzen

De bron- en beeldreviews uit [batch 1](vineyard-lessons-batch-1-review-2026-10-12.md),
[batch 2](vineyard-lessons-batch-2-review-2026-10-12.md) en
[batch 3](vineyard-lessons-batch-3-review-2026-10-12.md) zijn op 2026-10-12
afgerond en blijven de feitelijke publicatiebasis. Geen nieuwe wijnclaims,
bronrecords, toegangsdatums of mediabytes toegevoegd in deze integratie.
EU-/Demeter-scope blijft expliciet in les 8; OIV-/onderzoeksbronnen worden niet
als actuele lokale uitvoeringsregels gepresenteerd.

Alle acht geselecteerde PNG-records zijn actief, hebben NL/EN-alttekst en
geregistreerde generated rights; de bestaande markerlegenda's en relevante
vereenvoudigingen blijven aanwezig. Plantcomposiet, waterschema, diagnoseplaat
en oogstmanden krijgen geen andere feitelijke betekenis door pathmembership.
De browserchecks blijven de PNG-lading, legenda's en naslag in beide talen bewaken.

## Implementatie en regressiegrenzen

Het bestaande pathschema, de routing en de browserprogressadapter ondersteunen
het tweede path zonder nieuwe architectuur. Alleen het hardgecodeerde Nederlandse
label `Leerpad` op de Engelse pathpagina gelokaliseerd. Bestaande tests zijn
gericht bijgewerkt voor twee cataloguskaarten en naslagteruglinks die nu de
nieuwe geldige pathcontext dragen. Zelfstandige lesson-URLs blijven bruikbaar.

Nieuwe browserscenario's controleren het gehele pad, expliciete markering,
herladen, taalwissel met anker/context, hervatten, voltooiing, reset en tijdelijke
opslag. Een bestaand stille-wijnrecord wordt vooraf geladen; na werken met en
resetten van het nieuwe path blijft dat record byte voor byte gelijk en toont
het oude pad dezelfde voortgang. Geen wijzigingen aan het oude pathpackage,
de vijftien lessonpackages, bronnen/media of de progressimplementatie.

## Verificatie

- `npm run content:check`: **359 entities, 16 narratives, 2 paths, 612 sources,
  188 media**; vijftien actieve lessons, één regionale draft.
- `npm run format` en `npm run check`: formatting, ESLint, contentbuild,
  relationele audit (**295 actieve entities / 1342 forward relations**),
  Next-typegeneratie, TypeScript en **188 unit-tests in 24 bestanden** geslaagd.
- `npm run test:e2e -- --workers=4`: definitieve volledige herhaling op
  2026-10-13 geslaagd: productiebuild met **955 statische pagina's** en
  **188/188 browsertests**. Elf nieuwe pathscenario's; alle acht steps
  in NL/EN op **320/1440px**, volledige no-JS-route, twee progressie-/resetchecks,
  twee storagefallbackchecks, metadata, sitemap en vier aliasredirects.
  Bestaande a11y-/headingcontroles uitgebreid met path en afsluiting;
  overflow/reflow ook op **375/640/768/1024px** gecontroleerd.
- De eerste browserrun bracht twee onjuiste nieuwe testverwachtingen aan het
  licht: zonder JS zijn voltooiingsknoppen zichtbaar en uitgeschakeld, in plaats
  van afwezig. Tests gecorrigeerd en volledig herhaald; productgedrag behouden.
- Visuele browsercontrole **390/1440px**: beide cataloguskaarten op desktop,
  NL-pathkop en route/context, NL/EN-lescontext op mobiel, Engelse pathkop en
  afsluiting/vervolgsuggesties op mobiel, Nederlandse recap op desktop.
  Taalwissel behoudt het nieuwe path; titels, knoppen en tekst passen.
- Preview op **3101** herstart met de geteste build; nieuw path klaargezet.
  Geen deployment-/GitHubclaims. Planningslinks en Git diff gecontroleerd.

## Vervolg

`LRN-017` afgerond; **58** niet-afgeronde tickets. Eerstvolgend `EXP-032`:
inventaris met expliciete identiteit/owner en eerste Port/Sherry/Champagne-batch.
Latere catalogusbatches blijven open; de eerste batch is voldoende voorganger
voor `EXP-026`. Atlasafbakening (`MNT-051`) blijft zichtbaar in de productvolgorde.
`LRN-012` wacht op datum én werkelijk gebruik; feedback en `MNT-050` blijven
geparkeerd. Geen nieuwe blocker of onderhoudsticket uit deze ronde.
