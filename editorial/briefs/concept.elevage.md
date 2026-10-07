# Contentbrief — Élevage: opvoeding, zuurstof en rijping

Datum: 2026-10-06. Ticket: EXP-020. Archetype: concept-system-overview.

## Paginabelofte en ownership

Deze pagina is de canonical eigenaar van de samenhang tussen MLF, liescontact,
vatkeuze, tijd, zuurstofbeheer en assemblage tijdens de begeleiding van jonge
wijn. Bestaand ID `concept.elevage`, route `/concepts/maturation`, Nederlandse
alias en alle elf bestaande block-ID's blijven behouden. De roadmap en de
EXP-016-ownershipaudit autoriseren deze uitbreiding; geen tweede rijpingshub.

MLF, lees-ageing, bâtonnage, autolyse, oxidatie en assemblage blijven eigenaar
van hun mechanismen. Bottelvoorbereiding hoort bij `bottling` (EXP-021), latere
flesontwikkeling bij EXP-025. Geen vaste volgorde: MLF kan bij co-inoculatie
al tijdens de alcoholische vergisting beginnen.

## Outline en claimplan

| Coverage / block | Vraag | Bronnen | Diepte |
| --- | --- | --- | --- |
| identity-and-scope / jonge-wijn-begeleiden | Wat omvat opvoeding? | OIV oak; WSET oak | foundation |
| system-components-and-relationships / opbouw-en-samenhang | Welke beslissingen beïnvloeden elkaar? | AWRI MLF, lees; OIV blending | foundation |
| mechanisms-and-interactions / werking | Hoe veranderen zuur, contact, hout en zuurstof het materiaal? | AWRI MLF; OIV oak; WSET oak | foundation; intermediate timing |
| conditions-and-variation / vatkeuze | Wat veranderen materiaal, maat en vatleeftijd? | Napa oak; WSET oak | foundation; intermediate maat/leeftijd/toast |
| decisions-and-trade-offs / werk-in-de-kelder | Hoe verbind je bijvullen, overhevelen, lies en bescherming? | OIV oak; AWRI oak/lees; WRE cellar practices | foundation; intermediate lies/zuurstof; advanced zuurstofroutes |
| global-context-and-examples / wereldwijde-context | Welke praktijken laten andere combinaties zien? | WSET; Napa; Comité Champagne | foundation |
| evidence-and-limits / bewijs-en-grenzen | Welke conclusie laat een behandeling werkelijk toe? | AWRI leesproef; Wine Australia oxygen project | foundation; advanced proefopzet |
| practical-interpretation / richting-botteling | Hoe lees je een technische fiche en volg je de wijn verder? | OIV blending; AWRI pre-packaging | foundation; intermediate voorbereiding |

Specifieke claims: co-inoculatie is mogelijk tijdens de hoofdgisting (AWRI MLF);
houtleeftijd levert geen constante zuurstofdosis (AWRI oak); in de AWRI-proef
met Chardonnay veranderden MLF en liescontact samen (AWRI lees, p. 7). Geen
universele smaakgarantie, zuurstofdosis, rijpingsduur of kwaliteitsladder.

## Dependencies en gerichte review

- NL/EN-summary van MLF op timing controleren; bestaande co-inoculatie-uitleg behouden.
- Lies, bâtonnage, autolyse, oxidatie en assemblage gericht op overlap en
  systeemverwijzingen controleren; geen onnodige volledige herschrijving.
- `after-main-fermentation`: expliciete links naar liesrijping en autolyse en
  timingnuance toevoegen, introductiedoel en bestaande illustratie behouden.
- `maturation-and-protection` en `cellar-to-bottle`: procesvolgorde controleren;
  formuleringen die overlap uitsluiten gericht bijwerken.
- Bestaande graphrelaties hergebruiken; geen dubbele symmetrische relaties.

## Visual teaching contract en generatieprompt

Eén nieuwe PNG vergelijkt vier keuzegroepen. Een tank naast een vat laat
materiaalkeuze zien; een doorsnede toont wijn boven lies; bijvullen toont het
beheren van kopruimte; kleine proefmengsels tonen selectie vóór assemblage.
De vier vakken zijn gelijktijdig bruikbare keuzes, geen chronologische stappen.
Taalneutrale nummers met een volledige NL/EN-HTML-legenda. De bestaande
documentaire kelderfoto blijft behouden. Controle op materiaal, nummering,
leesbaarheid bij 390/1440 px en begrijpelijkheid zonder afbeelding.

Tool: ingebouwde `image_gen.imagegen`, nieuwe afbeelding, geen referentiebeeld.

```text
Use case: scientific-educational. Asset: landscape 3:2 PNG teaching plate for Oenocademy. Restrained editorial watercolor and gouache, believable winemaking objects, warm ivory paper, muted olive, limestone, steel grey, ochre oak and small burgundy wine accents. Four spacious equal vignettes arranged as a clean two by two comparison, each with just one small dark number 1, 2, 3, 4. No arrows: these are overlapping decisions, NOT a chronological production sequence.
1 top left: a closed stainless steel wine tank beside a traditional small horizontal oak barrel on a cradle, comparing storage materials.
2 top right: a simplified cutaway horizontal oak barrel filled with pale gold wine over a clearly visible thin layer of settled beige yeast lees on the bottom. No grape skins, no bubbles, no stirring tool. The cutaway is conceptual.
3 bottom left: a small metal jug gently topping up a horizontal oak barrel through its top bunghole using a narrow funnel. A restrained cutaway window in the barrel shows wine almost reaching the top and a very small headspace. This illustrates managing fill level; no oxygen particles, no splashing.
4 bottom right: a cellar bench with three small wine sample glasses containing different shades of red wine, one simple graduated blending cylinder with red wine and a slender glass pipette, showing small blending trials. No readable graduations or words.
Clear physical silhouettes and generous negative space, soft natural light, finely observed material textures, elegant contemporary textbook illustration, not vector clipart or a luxury label. No decorative background, no people, no maps, no logos. Numbers 1–4 are the ONLY text. Each vignette equally prominent, readable at small mobile widths. Do not connect the vignettes with arrows.
```

## Publicatiecontrole

- [x] Ownership, outline en dependencies vóór prose vastgelegd.
- [x] Bronnen, NL/EN en oude anchors gereviewd.
- [x] PNG inhoudelijk, technisch en responsief gecontroleerd.
- [x] Format, check, contentaudit en browsertests geslaagd.
- [x] Roadmaps en volgende taak bijgewerkt.

### Correctieprompt

Tool: ingebouwde `image_gen.imagegen`, edit van het eerste resultaat.

```text
Edit this four-panel educational watercolor plate. Preserve the entire layout, numbers, style and all objects except these precise corrections: In panel 2, raise the pale gold wine level almost to the top of the barrel interior, leaving only a very narrow headspace; retain the thin settled beige lees along the bottom and the clear cutaway front. In panel 3, remove the extra wooden bung on the barrel top completely. The funnel must be the ONLY opening in that barrel, directly inserted into its single top bunghole. Raise the liquid so it nearly reaches the barrel ceiling, leaving only a narrow headspace visible in the cutaway. Keep the pouring jug, funnel, frame, all other panels, their numbers, colours and image dimensions unchanged. These must look like properly filled winemaking barrels, not partially empty barrels.
```

## Bron- en contentreview — 2026-10-06

- AWRI MLF (2020), liescontact (2020), oak queries (2013), pre-packaging;
  OIV oak/blending; WSET oak; Wine Australia zuurstofproject en Comité Champagne
  geopend. Napa-publicatie via de geïndexeerde primaire tekst gelezen nadat
  rechtstreeks openen faalde; geen nieuwe kwantitatieve claim eraan ontleend.
- Nieuw bronrecord WRE/Joy Ting (2018) voor bijvullen, overhevelen en bewaking.
  De lokale voorschriften en doses uit die publicatie worden niet als algemene
  recepten overgenomen. Wine Australia's vroege-fasenonderzoek expliciet
  begrensd; AWRI-liesproef als voorbeeld van samenvallende variabelen.
- MLF-summary en les hebben nu dezelfde timingnuance. Lies, bâtonnage,
  autolyse en assemblage behouden hun mechanisme-uitleg; oxidatie blijft
  beschikbaar voor EXP-022/025. Geen extra hub of nieuwe begrippenentities.
- Drie introductielessen gericht gereviewd; doelen, blocks en illustraties
  behouden. Formuleringen over de procesvolgorde verfijnd, links naar
  lies/autolyse/opvoeding toegevoegd.
- PNG: `public/media/concepts/elevage/maturation-decisions.png`, 1536×1024.
  Definitieve versie met gecorrigeerde vulniveaus en één vulopening. Cutaways
  zijn schematisch; geen tijdlijn, zuurstofdeeltjes of kwantitatieve schaal.

## Behouden voorgeschiedenis

De oorspronkelijke outline van 2026-09-16 is hierboven uitgebreid naar het
systeemarchetype. De scopegrens blijft: geen producentenrecepten, apparatuur-
instructies, laboratoriummethoden, appellationregels of jaargangadvies. De
kelderfoto blijft documentair bewijs van zichtbare apparatuur; er worden geen
claims over vatinhoud, leeftijd of smaak uit afgeleid. De onderstaande review
is historisch en beschrijft de toenmalige clusterstand.

### Redactionele review — 2026-09-16

- Iteratie 1: dekkingsvragen per hoofdsectie gecontroleerd; definitie, werking, wijnstijlen en beperkingen geïntegreerd. Basis draagt de identiteit zelfstandig; verdieping verklaart keuzes en gevorderd behandelt niet-lineaire of microbiologische grenzen.
- Iteratie 2: het cluster onderling nagelopen. Bewust stoppen van vergisting onderscheiden van vastlopen; koolzuurmaceratie onderscheiden van koude schilinweking; kleur onderscheiden van tannine; élevage aangevuld met voorbereiding op botteling. Koolzuurmaceratie heeft een eigen draftrecord voor latere volledige uitwerking, geen tweede eigenaar op deze pagina.
- Iteratie 3: NL/EN naast elkaar gecontroleerd op gelijkwaardige blokken, diepte en betekenis. Geen Bordeaux als universele norm, geen vaste kelderrecepten of kwaliteitsscores. Fotografie toont daadwerkelijk zichtbare apparatuur of handelingen; captions begrenzen wat daaruit kan worden afgeleid.
- De secties beantwoorden de dekkingsvragen binnen deze paginabelofte; specialistische uitvoering en volledige deeltechnieken blijven bij hun eigen onderwerpen. Dit is een redactionele zelfcontrole, geen onafhankelijke expertcertificering.

## Eindcontrole — 2026-10-07

- `npm run format`, `npm run check` (148 tests), contentvalidatie, relatieaudit
  en productiebuild met webpack geslaagd. 353 entities, 286 actief, 67 draft,
  570 sources, 182 media en 1.299 forward relations.
- Volledige Playwright-suite: 121 tests geslaagd. Vier nieuwe controles toetsen
  NL/EN, mobiele/desktop-overloop, illustratie, leslinks, oude anchors,
  aliasredirect en leesbaarheid zonder JavaScript. De HTML-controle wacht op
  DOMContentLoaded zodat overige laadactiviteit de contentasserties niet ophoudt.
- Na de laatste aanvullende bronverwijzingen zijn check en productiebuild
  opnieuw geslaagd; de gerichte Learn/élevage-suite slaagde met 21 tests.
- Handmatige browserreview op 390×844 en 1440×1000: afbeelding, nummering,
  legenda en typografie passen; taalkeuze behoudt de passage en de Engelse
  legenda loopt goed af. Geen browserconsolefouten waargenomen. Viewport en
  Nederlandse taalvoorkeur na afloop hersteld.
- Link-/taalaudits uitgevoerd; brede suggestielijsten blijven reviewvoorraad
  voor EXP-026 en betekenen geen foutieve of gebroken links.
- Lokale preview herstart op 3101. De eerder geblokkeerde goedkeuringscontrole
  kon na hervatten worden afgerond. Geen commit of deployment uitgevoerd.
- Een tijdens de onderbreking aanwezige CSS-wijziging (`text-wrap: nowrap`
  bij tabellen) is behouden, niet door deze contenttaak toegevoegd. Checks en
  browsersuite omvatten de huidige gezamenlijke werkboom.
- EXP-020 afgerond. Eerstvolgende taak EXP-021: de bestaande bottling-owner
  uitbreiden met stabilisatie en verpakking. Mechanismen van fining en SO₂
  blijven bij hun eigen pagina's; flesontwikkeling blijft bij EXP-025.
