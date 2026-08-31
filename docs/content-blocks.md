---
title: "Markdown- en content-blockconventies"
status: "accepted"
version: "1.0"
created: "2026-08-31"
last_updated: "2026-08-31"
implementation: "pending-renderer"
---

# Markdown- en content-blockconventies

Dit document is het authoring- en renderercontract voor canonical entity-overviews en narratives. De syntax is besloten voor v1; parser, blockvalidatie en rendering worden in de volgende implementatiestap toegevoegd. Tot die tijd valideert `npm run content:check` alleen de bestaande pakketmetadata, localebestanden en entitylinks.

De conventions houden content portable en controleerbaar:

- gewone `.md`-bestanden blijven de canonical bron;
- een kleine directive-laag geeft betekenis aan blocks;
- Markdown bevat geen uitvoerbare componentcode;
- stabiele block-IDs verbinden NL en EN en leveren toekomstige anchors;
- entitylinks en bronverwijzingen gebruiken stable IDs;
- onbekende of ontbrekende kennis blijft zichtbaar onvolledig in plaats van opgevuld.

Lees dit document samen met `knowledge-architecture.md`, `product-principles.md`, `visual-language.md` en `../editorial/research-policy.md`.

## 1. Documentgrens

YAML bezit identiteit en paginametadata. Markdown bezit de gelokaliseerde body.

Daarom bevat een canonical Markdownbestand:

- geen frontmatter;
- geen H1;
- geen route, slug, status of canonical titel;
- geen gekopieerde relationele feiten die al structureel in YAML staan;
- alleen top-level content blocks in de hieronder vastgelegde syntax.

De pagina-renderer maakt de H1 uit `entity.names.<locale>` of `narrative.title.<locale>`. Zo kunnen titel, route en body niet ongemerkt van elkaar afwijken.

## 2. Gekozen syntax

Een block is een vlakke container directive:

```md
:::section{#bodem-en-water depth="advanced" source_refs="source.example-one source.example-two"}
## Bodem en water

Gelokaliseerde Markdowninhoud.
:::
```

Het contract is:

- precies drie dubbelepunten openen en sluiten een block;
- de blocknaam volgt direct op `:::`;
- iedere block heeft precies één verplichte `#id`;
- attributen staan tussen accolades en gebruiken dubbele aanhalingstekens;
- blocks staan uitsluitend op top-level en worden niet genest;
- inhoud buiten een block is ongeldig, behalve lege regels;
- onbekende blocknamen of attributen zijn validatiefouten.

We gebruiken bewust geen MDX, JSX, imports, scripts of raw HTML. Canonical wijncontent mag geen applicatiecode uitvoeren en blijft daardoor buiten React of een specifieke renderer bruikbaar.

## 3. Stable block-ID

Een block-ID is documentlokaal en volgt:

```text
[a-z0-9]+(?:-[a-z0-9]+)*
```

Voorbeelden:

```text
orientatie
klimaat-in-context
waarom-in-het-glas
classificatie-1855
```

Regels:

- IDs zijn uniek binnen een entity- of narrativepackage;
- dezelfde inhoudelijke block heeft in NL en EN exact dezelfde ID;
- IDs worden niet vertaald;
- IDs beschrijven het onderwerp, niet de positie (`bodem` in plaats van `blok-3`);
- een gepubliceerde ID blijft stabiel, ook als de heading of volgorde verandert;
- de globale identiteit van een block is conceptueel `<package-id>#<block-id>`.

Een ID is een technisch anker. De publieke UI toont menselijke headings en labels, niet de ID.

## 4. Gemeenschappelijke attributen

Iedere block ondersteunt uitsluitend deze gemeenschappelijke attributen:

| Attribuut | Vereist | Betekenis |
| --- | --- | --- |
| `#id` | ja | Stabiele documentlokale identiteit |
| `depth` | nee | `foundation`, `intermediate`, `advanced` of `specialist` |
| `source_refs` | nee | Door spaties gescheiden `source.*`-IDs die de block ondersteunen |

Wanneer `depth` ontbreekt, erft de block conceptueel de depth van de entity of narrative. Ontbreekt ook daar depth, dan doet de renderer geen niveauclaim. De toekomstige validator materialiseert die overerving niet terug naar canonical Markdown.

`source_refs` is een blockinventaris, geen vervanging voor een citation bij een specifieke betwistbare, juridische, numerieke, historische of geciteerde claim. Iedere genoemde source moet ook voorkomen in `source_refs` van de package-YAML. De pipeline blijft daarmee de volledige packageprovenance kennen.

Block-level `framework_alignment`, reviewstatus, layoutkeuzes en willekeurige CSS-classes horen niet in v1. Framework alignment blijft voorlopig package-level; presentatie blijft verantwoordelijkheid van de renderer.

## 5. V1-blocktypen

V1 blijft bewust klein. Gewone paragrafen, lijsten en tabellen binnen deze blocks lossen het grootste deel van de authoringbehoefte op.

### `summary`

Korte oriëntatie op de pagina. Geen heading in de body: de renderer presenteert dit als lead na de H1.

```md
:::summary{#orientatie depth="foundation"}
Deze voorbeeldtekst demonstreert alleen de plaats van een korte oriëntatie.
:::
```

Conventie: één of twee korte paragrafen; geen lijst, tabel of subheading.

### `objectives`

Concrete leerdoelen voor een `lesson`. De renderer voegt het gelokaliseerde label “Leerdoelen” toe.

```md
:::objectives{#leerdoelen depth="foundation"}
- Leg het centrale onderscheid in eigen woorden uit.
- Herken waar verdere broncontrole nodig is.
:::
```

Conventie: één ongeordende lijst met observeerbare doelen. Geen algemene beloftes zoals “alles begrijpen”.

### `section`

Het standaardblock voor uitleg. De eerste node is altijd een H2. Binnen het block mogen H3-subsecties staan; headingniveaus worden niet overgeslagen.

```md
:::section{#onderwerp-in-context depth="intermediate"}
## Onderwerp in context

De uitleg staat hier.

### Belangrijke nuance

Verdere uitleg staat hier.
:::
```

Een section is de default. Maak geen callout wanneer gewone uitleg voldoende is.

### `key-idea`

De ene gedachte die een lezer moet vasthouden. De renderer voegt het gelokaliseerde label “Kernidee” toe; auteurs schrijven dat label niet als heading.

```md
:::key-idea{#centraal-inzicht depth="foundation"}
Deze voorbeeldzin toont waar het centrale inzicht komt te staan.
:::
```

Conventie: maximaal enkele korte paragrafen. Geen verzameling losse weetjes.

### `caveat`

Een noodzakelijke beperking, onzekerheid, uitzondering of bewuste vereenvoudiging. Dit block ondersteunt als enige een extra attribuut:

```text
variant="simplification|uncertainty|exception"
```

```md
:::caveat{#grens-van-de-uitleg depth="advanced" variant="uncertainty"}
Deze voorbeeldtekst maakt zichtbaar welk deel van de uitleg nog onzeker is.
:::
```

De renderer kiest een menselijk, gelokaliseerd label op basis van `variant`. Een caveat mag niet worden gebruikt om een onvoldoende onderzochte hoofdclaim toch te publiceren.

### `in-the-glass`

Legt zorgvuldig uit waarom kennis mogelijk relevant is voor wat iemand waarneemt, zonder een tasting guarantee of deterministische causaliteit te suggereren. De renderer gebruikt in NL het label “Waarom doet dit ertoe in het glas?”.

```md
:::in-the-glass{#waarom-in-het-glas depth="intermediate"}
Deze voorbeeldtekst toont waar een onderbouwde koppeling naar waarneming komt.
:::
```

Sensory claims volgen altijd het researchbeleid en benoemen scope, variatie en onzekerheid waar relevant.

### `comparison`

Een expliciete vergelijking. De eerste node is een H2. Gebruik daarna korte parallelle paragrafen, een lijst of een eenvoudige tabel met duidelijke kolomkoppen.

```md
:::comparison{#twee-benaderingen depth="advanced"}
## Twee benaderingen naast elkaar

| Aspect | Benadering A | Benadering B |
| --- | --- | --- |
| Voorbeeldcriterium | Beschrijving | Beschrijving |
:::
```

Vergelijk alleen werkelijk vergelijkbare scopes en definities. Een tabel is geen excuus om ontbrekende cellen te verzinnen.

## 6. Welke blocks zijn vereist?

De publicatiestatus bepaalt hoe volledig een document moet zijn.

### Draftpackages

Een `draft` mag bewust onvolledig zijn. Zodra een draft structured blocks gebruikt, moeten syntax, IDs, bronreferenties en NL/EN-pariteit wel geldig zijn. Een draft wordt niet met filler aangevuld om aan een vormvereiste te lijken.

### Active entity

Een actieve entity heeft minimaal:

- precies één `summary`;
- alleen blocks waarvoor gecontroleerde inhoud bestaat.

Een entity hoeft geen narrative-lesstructuur te imiteren. Relations, assertions en sources blijven buiten de Markdownbody structureel beschikbaar.

### Active narrative

Iedere actieve narrative heeft minimaal:

- precies één `summary` als eerste block;
- minimaal één `section`;
- betekenis-equivalente NL- en EN-blockstructuur.

Een actieve narrative van type `lesson` heeft daarnaast:

- precies één `objectives` vóór de eerste `section`;
- minimaal één `key-idea`;
- minimaal één `in-the-glass`.

Andere narrative-types gebruiken deze didactische blocks alleen wanneer ze inhoudelijk passen. Een historical essay krijgt bijvoorbeeld niet automatisch een `in-the-glass`-block.

## 7. Gewone Markdown binnen blocks

Ondersteund voor v1:

- paragrafen;
- nadruk en sterke nadruk;
- H2 en H3 waar het blocktype die toestaat;
- geordende en ongeordende lijsten;
- gewone interne en externe links;
- gevalideerde entitylinks;
- inline citations;
- blockquotes met citation;
- eenvoudige GFM-tabellen;
- inline code uitsluitend wanneer de letterlijke notatie inhoudelijk nodig is.

Niet ondersteund in canonical content:

- H1;
- raw HTML;
- MDX/JSX, imports, exports of JavaScript;
- geneste directives;
- willekeurige custom directives;
- layoutinstructies, CSS-classes of presentatietokens;
- iframes of embedded third-party widgets;
- handgeschreven voetnootnummers;
- afbeeldingen zolang het media- en creditscontract nog niet is geïmplementeerd.

Fenced codeblocks horen normaal niet in wijncontent. Als een toekomstige inhoudelijke use-case ze werkelijk nodig heeft, wordt dat bewust aan het contract toegevoegd.

## 8. Entitylinks

De bestaande, geïmplementeerde syntax blijft ongewijzigd:

```md
[[producer.example-estate]]
[[producer.example-estate|Example Estate]]
```

- Zonder label kiest de renderer het gelokaliseerde entitylabel.
- Met label gebruikt de renderer exact de authored zichtbare tekst.
- De target is altijd een bekende stable entity-ID.
- Auteurs hardcoderen geen applicatieroutes.
- Mentions en backlinks worden uit deze links afgeleid.

Een custom label mag grammaticaal helpen, maar mag de identiteit of aard van de target niet verdraaien.

## 9. Citations en blockprovenance

Inline citations gebruiken een compacte, niet-uitvoerbare extensie:

```md
Een ondersteunde claim staat hier. [@source.example-register]
Een precieze claim staat hier. [@source.example-book; p. 42–43]
```

Het deel vóór de eerste puntkomma is altijd exact één stable `source.*`-ID. Het optionele deel erna is een menselijke locator, bijvoorbeeld een pagina, artikel, tabel of hoofdstuk.

Regels:

- iedere citation target bestaat in `data/sources/`;
- de source staat in `source_refs` van de block én de package-YAML;
- citations staan direct na de claim die zij ondersteunen;
- een letterlijk citaat heeft altijd een precieze locator;
- citationnummers en bibliografische presentatie worden door de renderer afgeleid;
- een kale URL of Markdownlink geldt niet als provenance;
- AI-output is nooit een citation target.

Meerdere bronnen krijgen afzonderlijke citations. De renderer mag ze visueel groeperen, maar de authored bronidentiteiten blijven apart:

```md
Een syntheseclaim staat hier. [@source.example-one] [@source.example-two; hoofdstuk 3]
```

## 10. NL/EN-pariteit

De twee localebestanden delen dezelfde onderliggende kennis en dezelfde structurele ruggengraat.

Hard contract:

- dezelfde block-IDs;
- dezelfde blocktypen;
- dezelfde blockvolgorde;
- dezelfde `depth` per block;
- dezelfde `variant` voor caveats.

Redactioneel contract:

- headings en tekst zijn volwaardig gelokaliseerd, niet woordelijk gespiegeld;
- betekenis, scope, kwalificaties en onzekerheid blijven gelijkwaardig;
- extra of ontbrekende entitymentions en sources zijn alleen toegestaan wanneer daar een bewuste redactionele reden voor is;
- alle gebruikte sources staan in de gedeelde package-YAML;
- ontbrekende vertaling wordt een expliciete incomplete state, geen fallbacktekst.

De toekomstige validator controleert het harde contract automatisch en rapporteert verschillen tussen mentions en sourcegebruik ter review zonder daar automatisch feitelijke conclusies uit te trekken.

## 11. Volledig structureel voorbeeld

Dit voorbeeld demonstreert syntax en bevat bewust geen publiceerbare wijnfeiten:

```md
:::summary{#orientatie depth="foundation"}
Deze korte tekst oriënteert de lezer op het onderwerp en de afbakening.
:::

:::objectives{#leerdoelen depth="foundation"}
- Benoem het centrale onderscheid.
- Leg uit waarom de afbakening belangrijk is.
:::

:::section{#centrale-uitleg depth="foundation"}
## Centrale uitleg

Hier staat de door bronnen ondersteunde uitleg, met waar relevant een link naar [[concept.example|het voorbeeldconcept]].
:::

:::key-idea{#centraal-inzicht depth="foundation"}
Hier staat één kernidee dat de lezer moet onthouden.
:::

:::caveat{#belangrijke-beperking depth="advanced" variant="simplification"}
Hier wordt een bewuste vereenvoudiging zichtbaar gemaakt.
:::

:::in-the-glass{#waarom-in-het-glas depth="intermediate"}
Hier staat een zorgvuldig begrensde koppeling naar mogelijke waarneming.
:::
```

`concept.example` is uitsluitend een syntaxplaceholder en geen bestaande entity. Een echt contentbestand zou daarom pas valideren nadat een echte target is gekozen.

## 12. Renderer- en validatorcontract voor stap C

De implementatie van stap C moet:

1. Markdown en directives tijdens build/server rendering naar een veilige AST parsen;
2. raw HTML, uitvoerbare code, onbekende directives en onbekende attributen weigeren;
3. top-level structuur, block-IDs, typevereisten en NL/EN-pariteit valideren;
4. entitylinks via de canonical routinglaag oplossen;
5. citations en `source_refs` tegen het sourceregister valideren;
6. mentions, blockmetadata en sourcegebruik in de gegenereerde bundle opnemen;
7. semantische HTML met één pagina-H1 en een logische headingstructuur renderen;
8. stabiele, focusbare anchors voor blocks leveren zonder technische IDs als hoofdlabel te tonen;
9. tabellen, links, citations en callouts toegankelijk en responsive presenteren;
10. draft/incomplete content eerlijk blijven afhandelen.

Presentatie volgt `visual-language.md`; de renderer verzint geen inhoud, headings, captions, labels met feitelijke betekenis of ontbrekende vertalingen.

## 13. Bewust uitgesteld

Niet onderdeel van deze v1-conventions:

- images, galleries, audio en video totdat media-ID, rights, credits en alt-textmetadata zijn besloten;
- data-driven kaarten en geografische embeds;
- interactieve quizzes of exercises;
- willekeurige componentembedding;
- block-level framework alignment;
- conditionele content per gebruiker of opleidingskader;
- automatisch gegenereerde samenvattingen;
- layoutvarianten die auteurs visueel kunnen kiezen.

Nieuwe blocktypen worden pas toegevoegd wanneer Bordeaux of een volgende echte contentmigratie een terugkerende use-case oplevert die niet helder met de bestaande blocks kan worden geschreven.
