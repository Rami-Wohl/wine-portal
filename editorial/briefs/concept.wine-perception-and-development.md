# EXP-025 — Waarneming en wijnontwikkeling

Peildatum: 2026-10-11. Owner: `concept.wine-perception-and-development`.
Archetype: concept-system-overview. NL/EN delen identiteit, feiten en block-ID's.

## Scope en outline vóór uitwerking

Eén systeem verbindt samenstelling, waarneming en verandering door de tijd.
Chemische analyse, beschrijving, kwaliteitsoordeel en voorkeur beantwoorden
verschillende vragen. Geen drinkvenstercalculator of universele kwaliteitsladder.
Zuur, tannine, oxidatie, élevage en botteling behouden hun mechanisme-eigenaarschap.

| Coverage / block | Vraag en laag | Bewijsbasis |
| --- | --- | --- |
| identity-and-scope / overzicht | Hoe verhouden wijn, proever en tijd zich? Foundation | Spence; Echave |
| system-components-and-relationships / opbouw-en-samenhang | Geur, smaak, mondgevoel en context. Foundation | AWRI AWAC; WSET mondgevoel; Spence |
| mechanisms-and-interactions / werking | Mengsels, balans en flesverandering. Foundation; intermediate drempels | Ilc; AWRI AWAC; Echave; Tarasov |
| conditions-and-variation / omstandigheden-en-variatie | Proeftemperatuur, herhaling, bewaring. Foundation | AWRI AWAC/storage; Spence |
| decisions-and-trade-offs / keuzes-en-afwegingen | Vergelijken, bewaren, kwaliteit en voorkeur. Foundation | AWRI AWAC; Spence; AWRI storage |
| global-context-and-examples / wereldwijde-context | Rheingau TDN en Australische bewaarproeven. Foundation | Tarasov; AWRI storage |
| evidence-and-limits / bewijs-en-grenzen | Wat bewijst welke meting? Foundation; advanced onderzoeksopzet | Ilc; Tarasov; AWRI AWAC; Spence |
| practical-interpretation / betekenis-voor-wijn | Welke vragen stel je bij een glas en bewaarkeuze? Foundation | Voorgaande synthese |

Directe claims: orthonasaal/retronasaal; astringentie is tactiel; zoet/zuur
interactie; detectie/herkenning/afwijzing; mengselmaskering; zuurgekatalyseerde
TDN-vorming; kleur-/fenoolreacties; temperatuur/licht/bewaarproefscope.
Geen numerieke drempels als universele normen. Geen leeftijd uit kleur afleiden.

## Voorbeelden en dependencies

Rheingau Riesling: de onderzoeksvragen detectie, herkenning en afwijzing zijn
verschillend; panel en matrix begrenzen de uitkomst. Australische Chardonnay/
Riesling-bewaarproeven: sluiting en proefopzet horen bij een conclusie over
flesoriëntatie. Zoete, mousserende en versterkte wijnen zijn contrasterende
families, geen landensmaakgaranties. Vervanging door andere wijnen verandert
het systeemmodel niet. Geen nieuwe draftdependencies.

Bestaande links: wine-composition, acidity, tannin, oxidation, elevage,
bottling, sulfur-dioxide, sweet-wines, sparkling-wines, fortified-wines.
Vineyard-soils blijft eigenaar van de bodemketen; de hub behandelt minerality
als variabel sensorisch woord binnen evidence-and-limits (intermediate).
De les cellar-to-bottle is consumer; de lesvolgorde blijft gelijk.

## Bronnenreview

Geopend en inhoudelijk gelezen op 2026-10-11: AWRI Advanced Wine Assessment
Course notes (bestandsversie 28092022), Spence (2020), Ilc, Werck-Reichhart &
Navrot (2016), Tarasov et al. (2020; volledige uitgevers-PDF), Echave et al.
(2021; volledige PDF in institutionele IPB-repository), AWRI Transport and
storage, en de bestaande WSET-mouthfeelbron (2026).

De Echave-review bevat sterke algemene kwaliteitsformuleringen en problematische
TDN-duidingen. Die worden niet overgenomen. Voor TDN zijn de primaire proef en
haar inleiding leidend; de review draagt alleen brede kleur-/fenoolveranderingen.
PMC-captcha's en niet bereikbare publisher-HTML worden niet als gelezen bewijs
gepresenteerd. Geen auteursrechtelijk beeldmateriaal uit publicaties hergebruikt.

## Visual teaching contract en definitieve prompt

Teaching question: wat is het verschil tussen aroma ruiken vóór een slok,
geur en mondgevoel tijdens proeven, en verandering van de wijn zelf tijdens
bewaring? Drie genummerde naturalistische vignetten met volledige HTML-uitleg.
Een gewone foto maakt deze abstracte vergelijking niet vanzelf duidelijk.
Geen anatomie, tongkaart, moleculen, aromawolkjes, kwaliteitsladder of verplichte
kleurverandering. De illustratie is een leesmodel, geen waarnemingsbewijs.

```text
Use case: scientific-educational
Asset type: Oenocademy educational PNG, landscape 1536×1024.
Primary request: three calm numbered naturalistic vignettes about smelling,
tasting and the passage of time in bottled wine. Left vignette numbered 1:
adult woman shown in a believable three-quarter profile, holding a small clear
wine glass just below her nose, smelling a small pour of ruby wine. Middle
vignette numbered 2: the same adult after taking a small sip, lips gently
closed, reflective neutral expression, holding the glass lowered at chest
level. Right vignette numbered 3: an unbranded sealed dark wine bottle, a small
glass of ruby wine and a modest hourglass representing time, with no comparison
claim that older wine is better. Distinct separated scenes on warm ivory paper.
Style: refined editorial watercolour and gouache with lightly textured edges,
believable hands and transparent glass, muted burgundy, sage and warm brown,
quiet Oenocademy educational house style. Spacious composition with no borders
or infographic panels. All scenes fully within frame. Only text is small clear
numbers 1, 2 and 3 below their scenes. No title, labels, logos, watermark,
arrows, anatomical cutaways, tongue map, visible aroma clouds, fruit props,
chemistry, age-to-colour scale, score, or implication of improvement over time.
```

Uitvoering: ingebouwde image_gen-tool; prompt hierboven is de volledige prompt.
Beeldreview: drie correcte genummerde scènes, rustige PNG op 1536×1024.
Glas, handen en houding zijn geloofwaardig. Geen anatomische claims,
kwaliteitsladder of verplichte kleurverandering. HTML bevat de volledige uitleg.

Aanvullende bronnenreview: de institutionele abstract van Parr et al. (2018)
bij Aberystwyth University is gelezen voor de beperkte claims over variabele
definities en meerdere compositieverbanden. De volledige PDF was niet
bereikbaar; er zijn geen gedetailleerde proefuitkomsten uit overgenomen. De
bestaande bronidentiteit en oorspronkelijke toegangshistorie blijven behouden.

Publicatiereview en controles volgen na uitwerking.

## Publicatiereview — 2026-10-11

Review-ID: `QCR-2026-10-11-02`. Interne redactionele en technische review;
geen onafhankelijke menselijke goedkeuring geclaimd.

- Outline, bronclaims, dependency-eigenaarschap, NL/EN-pariteit en alle acht
  coveragevragen gereviewd. Foundation draagt de hoofdlijn; drempels en
  minerality zijn intermediate, onderzoeksopzet advanced. Gedeelde block-ID's.
- Zeven bestaande conceptpagina's en de les cellar-to-bottle verwijzen naar
  de hub. Zeven canonical related_to-relaties staan uitsluitend bij de nieuwe
  owner; de les benoemt de owner in related_entities. Geen nieuwe draft,
  URL-wijziging van bestaande owners of duplicatie van feitenmetadata.
- Nieuwe PNG met lokale bytes, SHA-256, juiste afmetingen, gelokaliseerde
  alttekst en volledige HTML-uitleg. Op desktop en mobiel visueel gelezen;
  nummering blijft begrijpelijk zonder tekst in het beeld.
- `npm run format`, `npm run check`, contentvalidatie en relation-audit
  geslaagd: 148 unit-tests, 359 entities (295 actief, 64 draft), 8 narratives,
  1 leerpad, 612 sources en 188 media-assets.
- Webpack-productiebuild geslaagd. Eerste volledige browserrun: 159 geslaagd,
  twee nieuwe cases faalden uitsluitend op de onjuiste verwachting dat de
  responsive afbeelding naturalWidth 1536 moest hebben. De optimizer levert
  mobiel een kleinere variant. Test gecorrigeerd naar succesvol geladen beeld;
  de bronafmetingen blijven via mediametadata/contentvalidatie gecontroleerd.
  Vervolgens de volledige suite tegen dezelfde gebouwde preview: **161/161
  geslaagd**, waaronder alle acht nieuwe cases.
- Nieuwe browsercases controleren NL/EN, acht secties, tabellen, PNG, drie
  dieptedetails, incoming links, zoeken/sitemap, NL-alias, taalwissel met hash,
  390/768/1440 px zonder pagina-overloop en content zonder JavaScript.
- Handmatig via de in-app browser: NL/EN-titel en header, mobiele taalwissel,
  PNG met drie uitlegregels op 390/1440 px, tabelomloop op 768 px, Nederlandse
  intermediate/minerality-weergave. Geen nieuwe visuele afwijking gevonden.
- `content:language-audit` uitgevoerd: heuristische redactionele kandidaten,
  geen validatorfouten; geen automatische corpuswijziging. Roadmaps, coverage
  en onderhoudsoverzicht bijgewerkt. Geen nieuw onderhoudsticket nodig.

De volgende ontwikkeltaak is EXP-032. Inventariseer eerst identiteit, bestaande
bestemming en bronnen van individuele wijnen. Eerste publicatiebatch:
Port/Sherry/Champagne; latere batches blijven onderdeel van het open ticket.
Accounts/API/database blijven bij MNT-050 met het bestaande beslismoment.

Beeldbestand: `public/media/concepts/wine-perception-and-development/smelling-tasting-and-time.png`.
De volledige generatieprompt staat hierboven; ingebouwde image_gen gebruikt.
