# Individuele wijnpagina's — eerste batch

Review-ID: `QCR-2026-10-13-03`  
Datum: 2026-10-13  
Scope: `EXP-032`, inventaris en Port/Sherry/Champagne, inclusief gerichte
family-/proceslinks. De integrale foundationreview blijft `EXP-026`.

## Identiteit, bronnen en inhoud

De [scopebrief](briefs/exp-032-first-wines.md) is vóór scaffolding en prose
vastgelegd. De [inventaris](briefs/exp-032-wine-inventory.md) geeft alle genoemde
kandidaten een passende bestaande of voorgestelde owner en een batchvolgorde.
Drie beschermde wijnnamen zijn als appellation gepubliceerd, met eigen
schema-2-plan en gelijkwaardige NL/EN. Er is geen nieuw entitytype ingevoerd.

Port behandelt de Douro-oorsprong, versterking tijdens de gisting, ruby/tawny,
wit/rosé, Vintage/LBV/colheita en leeftijdsaanduidingen. Het huidige IVDP-overzicht
van bijzondere categorieën is leidend bij de recente zeer oude categorieën;
promotionele kwaliteitsrangordes zijn niet overgenomen.

Sherry onderscheidt droge en zoete typen, flor/oxidatieve rijping en
solera/añada. De mogelijkheid van droge onversterkte wijn is gecontroleerd in
het Junta-productdossier en de definitieve EU-verordening 2025/1713, gepubliceerd
op 4 augustus en in werking sinds 24 augustus 2025. De BOE-weergave van het
officiële EU-besluit was leesbaar; EUR-Lex gaf een robotcontrole. De geregistreerde
URL verwijst daarom naar BOE. Het Junta-documentenregister bevestigt de status.
Het Consejo-nieuws uit 2022 is niet als definitief inwerkingtredingsbewijs gebruikt.
De verouderde suikergrenzen in algemene Consejo-uitleg zijn niet overgenomen.
Manzanilla blijft een afzonderlijke beschermde herkomst, met eigen latere batch.

Champagne behandelt de wijnnaam tegenover de streek, hoofddruiven, basiswijn,
assemblage, flesgisting, gistrijping, remuage/dégorgement, producentencodes en
drie onafhankelijke etiketvragen. INAO-publicatie over een wijzigingsvoorstel
is niet als vastgesteld recht gebruikt. De huidige Comité-druivenpagina en een
oudere infographic verschillen in het totale aantal rassen; de introductie noemt
de drie hoofdrassen en het bestaan van overige toegestane rassen, zonder een
onterecht volledige wettelijke lijst te claimen.

Achttien nieuwe bronrecords zijn toegevoegd; negen bestaande bronrecords zijn
daadwerkelijk heropend en hun toegangsdatum bijgewerkt. De bronnen staan bij de
betreffende claims en blocks, met equivalente NL/EN-bronverwijzingen.

## Dependencies, links en beeld

Drie regio's en zes herbruikbare druiven zijn vooraf als draft gescaffold. De
laatste graafreview heeft ook Moscatel de Alejandría als zevende druif toegevoegd,
naast Palomino en Pedro Ximénez: de drie belangrijkste Sherryrassen hebben nu
ieder een passende identiteit en relatie.
Chardonnay en Touriga Nacional zijn bestaande IDs en zijn behouden. Tinta Roriz
is een alias van het nieuwe Tempranillo-record. Alle drie appellations hebben
een regionale parent, belangrijke druiven en gerichte procesrelaties. De lokale
druiven- en herkomstuitleg staat op de actieve pagina zelf; lege drafts zijn niet
als leesadvies gepresenteerd. REG-002/003 prioriteren hun eigen monografieën.

De families versterkt, zoet en mousserend en de processen versterken en
traditionele methode verwijzen naar de nieuwe owners. Bij versterken en de
versterkte familie is de klassieke Sherryroute nauwkeuriger afgebakend tegenover
de huidige onversterkte mogelijkheid. Bestaande family-/procesowners blijven
hun algemene uitleg dragen.

Port gebruikt een foto van Alex Ristea (CC BY-SA 2.0); Sherry een kelderfoto van
Anual (CC BY-SA 4.0). Beide Commons-bestanden, rechten en zichtbare inhoud zijn
gecontroleerd; de beelden zijn tot 1600 pixels breed verkleind en de gewijzigde
bytes hebben eigen checksums. De Port-bronversie had al een door een
Commons-bewerker verwijderd watermerk. Dit staat bij de transformatiehistorie.
Champagne hergebruikt het bestaande remuagerek van Amanda Slater (CC BY-SA 2.0)
als procesvoorbeeld. Zijn alttekst noemt neutraal wijnflessen; de foto wordt niet
als bewijs van een geografische locatie opgevoerd. Er zijn geen SVG's toegevoegd.

## Validatie

De eerste visuele controle liet zien dat de renderer drafttargets ook via
broodkruimels en gerelateerde onderwerpen ontsloot. `MNT-067` filtert die nu
op actieve entitypagina's vóór de vorming van navigatiegroepen. De canonical
graph en directe noindex-reviewroutes blijven behouden. De nieuwe browsertests
controleren dit in beide talen. Projectcheck en browsersuite zijn na deze
correctie opnieuw uitgevoerd.

- `npm run format` en `npm run check`: geslaagd; 190 tests in 25 files, lint,
  types, contentbuild en relation-audit groen.
- Productiebuild met Next 16.4.0/webpack: geslaagd, 981 statische pagina’s.
- Volledige Chromium-suite: **199/199 geslaagd**, twee workers, geen retries,
  circa 1,5 minuut. Deze run is na MNT-067 opnieuw uitgevoerd.
- Elf nieuwe browsertests controleren NL/EN, heen-/teruglinks, foto’s/credits,
  diepte en directe blockankers, no-JS, zoeken en sitemap. Overflowcontrole
  op 320, 768 en 1440 pixels; mobiele instap op 390 pixels.
- Na toevoeging van de laatste Moscatel-draftrelatie zijn de projectcheck,
  de definitieve build met 981 pagina's en alle elf wijnpaginatests nogmaals
  geslaagd, zonder retries.
- Visuele browsercontrole van alle drie pagina’s op desktop en mobiel, met
  NL/EN-voorbeelden, foto’s en bijschriften. Bronnen en bronanker op 320 pixels
  gecontroleerd; geen afgesneden tekst of horizontale overflow gezien.
- Directe Jerez-draftreviewroute gecontroleerd: eerlijke incomplete state,
  relatie naar actieve Sherry behouden, `noindex, follow`. Actieve Sherry toont
  alleen actieve verwante concepts en biedt geen lege regionale/druivenpagina’s aan.
- `content:check`, `content:link-audit` en `git diff --check`: uitgevoerd.
  De linkaudit is een kandidatenlijst, geen geslaagde inhoudelijke afhandeling
  van alle corpuslinks; die volledige review blijft EXP-026.

De definitieve preview draait op poort 3101. Dit is lokale validatie van deze
wijzigingen; de door de gebruiker bevestigde GitHub-run betreft de vorige push.

## Resterend werk en volgende taak

EXP-032 blijft gedeeltelijk open voor drie geordende catalogusbatches. Bestaande
Sauternes-, passito- en vin-de-paillepagina's worden hergebruikt; Tokaj is een
regionale parent en geen vervanging voor uitleg over Tokaji Aszú. De nieuwe
regio-/druivendrafts zijn geen automatisch publicatieakkoord voor monografieën.

**EXP-026 is de volgende taak.** Neem daarin owner/consumergrenzen, wereldwijde
terminologie, gerelateerde onderwerpen en resterende contextual links mee.
Het linkauditrapport bevat ook woordtreffers zoals het Engelse “port” voor haven;
beoordeel betekenis vóór linken. Een kandidaat is geen ontbrekende verplichte
link. De drie resterende EXP-032-batches volgen na EXP-028, zodat Atlasafbakening
niet op de hele catalogus hoeft te wachten.

De gebruiker bevestigde een geslaagde GitHub-run na commit/push. MNT-056 bewaart
die bevestiging en de nog ontbrekende repository-/Vercel-acceptatie. Er is in
deze contentronde één direct afgerond onderhoudsticket (`MNT-067`); de 58 niet-afgeronde
tickets blijven traceerbaar in de actuele productroadmap.
