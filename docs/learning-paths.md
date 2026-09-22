# Learning-pathcontract

Status: accepted
Versie: 1.0
Datum: 2026-09-23

Dit document is het canonical authoringcontract voor learning paths. Het is
ontworpen tegen het goedgekeurde pilotcurriculum **Van druif naar stille wijn —
hoe wijn wordt gemaakt**. `DEC-LRN-008`, `DEC-LRN-009` en `DEC-LRN-010` zijn op
2026-09-23 goedgekeurd; schema, validatie en runtime-indexes zijn geïmplementeerd.

## 1. Verantwoordelijkheid

Een learning path bezit uitsluitend de volgorde en leercontext rond bestaande
canonical lessons. Het bezit geen wijnfeiten en kopieert geen entity- of
lessonproza.

```text
entity                 eigenaar van stabiele onderwerpkennis
lesson narrative       eigenaar van samenhangende didactische uitleg
learning path          eigenaar van volgorde, doelgroep en leercontext
progress adapter       eigenaar van gebruikersstaat
```

De grens is belangrijk voor een latere API of database: curriculumcontent kan
file-backed blijven terwijl alleen gebruikersvoortgang van opslagadapter
wisselt.

## 2. Packagevorm

Een path wordt één self-contained package:

```text
content/learning-paths/<canonical-slug>/
└── learning-path.yaml
```

V1 gebruikt geen path-Markdown. Alle authored pathtekst is kort, structureel en
tweetalig: titel, samenvatting, doelgroep, voorkennis, leerdoelen, stepcontext
en afsluiting. Langere inhoud is per definitie een lesson of narrative en krijgt
daar een canonical eigenaar.

De directoryslug helpt mensen navigeren maar is geen identiteit. De stable ID
in YAML blijft leidend.

## 3. Schema v1

```yaml
schema_version: 1
id: learning-path.from-grape-to-still-wine
status: draft
curriculum_level: understand
title:
  nl: Van druif naar stille wijn
  en: From grape to still wine
slugs:
  nl: van-druif-naar-stille-wijn
  en: from-grape-to-still-wine
summary:
  nl: Volg de belangrijkste keuzes van rijpe druif tot gebottelde stille wijn.
  en: Follow the key decisions from ripe grape to bottled still wine.
audience:
  nl: Voor wijnliefhebbers met ongeveer WSET Level 2-voorkennis.
  en: For wine lovers with knowledge broadly comparable to WSET Level 2.
prerequisites:
  nl:
    - Je weet globaal wat droge wijn, zuur, tannine en alcohol zijn.
  en:
    - You broadly understand dry wine, acidity, tannin and alcohol.
objectives:
  nl:
    - Leg de hoofdroute van gezonde druif tot gebottelde stille wijn uit.
  en:
    - Explain the main route from healthy grapes to bottled still wine.
steps:
  - id: grape-as-raw-material
    target: narrative.lesson.grape-as-raw-material
    context:
      nl: Begin bij wat de geoogste druif de kelder binnenbrengt.
      en: Start with what the harvested grape brings into the winery.
  - id: grape-to-must
    target: narrative.lesson.grape-to-must
    context:
      nl: Volg hoe fysieke keuzes de eerste productieroute bepalen.
      en: Follow how physical choices establish the first production route.
completion:
  recap:
    nl:
      - Je kunt de productieroute van druif tot fles in volgorde uitleggen.
    en:
      - You can explain the production route from grape to bottle in order.
  encouragement:
    nl: Mooi werk: je hebt nu een compleet basismodel om wijnmaken te begrijpen.
    en: Well done: you now have a complete foundation for understanding winemaking.
  suggestions:
    - id: explore-fermentation
      target: concept.fermentation
      context:
        nl: Verdiep je verder in alcoholische vergisting.
        en: Explore alcoholic fermentation in more depth.
```

Het voorbeeld is bewust ingekort. Het canonical pilotpackage krijgt alle zeven
goedgekeurde steps en meerdere passende vervolgsuggesties.

## 4. Velden en betekenis

### Identiteit en lifecycle

| Veld | Vereist | Contract |
| --- | --- | --- |
| `schema_version` | ja | Voor v1 exact `1`; maakt latere migratie expliciet |
| `id` | ja | `learning-path.<canonical-slug>`; globaal uniek en na publicatie onveranderlijk |
| `status` | ja | `draft`, `active` of `deprecated` |
| `curriculum_level` | ja | `understand`, `explain` of `analyze`; publieke labels worden centraal gelokaliseerd |

De interne levelwaarden betekenen respectievelijk **Wijn begrijpen**, **Wijn
verklaren** en **Wijn doorgronden**. Zij hebben geen automatische relatie met
`foundation`, `intermediate`, `advanced` of `specialist` op contentblocks.

### Gelokaliseerde presentatie

| Veld | Vereist | Contract |
| --- | --- | --- |
| `title` | ja | Korte NL- en EN-titel |
| `slugs` | ja | NL- en EN-slug; de Engelse slug is de taalneutrale canonical route, de Nederlandse mag redirecten |
| `summary` | ja | Eén korte belofte die scope en opbrengst eerlijk samenvat |
| `audience` | ja | Menselijke omschrijving van de beoogde gebruiker |
| `prerequisites` | ja | Korte NL- en EN-lijsten; lege lijsten zijn toegestaan wanneer werkelijk geen voorkennis nodig is |
| `objectives` | ja | Observeerbare uitkomsten in NL en EN, minimaal één per taal |

NL en EN delen dezelfde identiteit, volgorde en targets. Gelokaliseerde lijsten
moeten inhoudelijk equivalent zijn, maar hoeven niet woordelijk dezelfde lengte
te hebben.

### Steps

`steps` is een niet-lege, geordende array. De arrayvolgorde is de enige
canonical volgorde; er komt geen dubbel `position`-veld.

Iedere step bevat:

- een binnen het path unieke, stabiele lokale `id` in kebab-case;
- precies één `target` naar een bestaande narrative van type `lesson`;
- korte gelokaliseerde `context` die uitlegt waarom deze lesson hier volgt.

De globale identiteit van een step is conceptueel
`<learning-path-id>#<step-id>`. Voortgang bewaart deze identiteit, niet de
positie of titel. Een gepubliceerde step-ID verandert daarom niet wanneer prose
of volgorde later wijzigt.

V1 heeft geen `required`, `optional`, `duration`, `score`, `unlock`, `quiz` of
`completion_rule`. Iedere pathstep is een kernles en voltooiing ontstaat later
alleen door de expliciete gebruikersactie uit `LRN-009`.

### Naslag is geen step

Entitypagina's en niet-lesson narratives kunnen in lessonproza als canonical
naslag worden gelinkt. Zij verschijnen niet in `steps`, tellen niet mee voor
voortgang en krijgen geen voltooiingsstatus. Zo blijft voor gebruikers helder
wat de leerroute vormt en wat vrijwillige verdieping is.

V1 voegt geen aparte pathbrede `references`-lijst toe. De auteur plaatst een
naslaglink waar die inhoudelijk nodig is; de lessonbrief bewaart de bewuste
block- en claimselectie. Een later overzicht van alle naslag kan desgewenst uit
daadwerkelijke lessonlinks worden afgeleid in plaats van handmatig dubbel te
worden onderhouden.

### Succesbestemming

`completion` is authored onderdeel van ieder path en bevat:

- een `recap` met concrete, gelokaliseerde leeropbrengsten;
- één gelokaliseerde `encouragement` zonder certificeringsclaim;
- minimaal één authored `suggestion` met stabiele lokale ID, bekend canonical
  target en korte gelokaliseerde context.

Een suggestion mag verwijzen naar een entity, narrative of learning path. Voor
een actief path moet ieder target actief zijn. De UI haalt targettitel en route
uit de canonical record; het path kopieert die niet.

## 5. Besloten grenzen

### `DEC-LRN-008` — Core steps

In v1 zijn uitsluitend narratives van type `lesson` core steps.
Entities zijn altijd naslag.

Dit houdt voortgang begrijpelijk, voorkomt dat een lange encyclopedische pagina
zich als les moet gedragen en laat iedere lesson een eigen leerboog,
doelstellingen en glas-koppeling bezitten. Als werkelijk gebruik later een
uitzondering bewijst, kan het targetcontract doelgericht worden uitgebreid.

### `DEC-LRN-009` — Hoeveel prose bezit een path?

Alleen compacte structurele UI-prose staat in `learning-path.yaml`:
titel, summary, audience, prerequisites, objectives, stepcontext en completion.
Er komt geen path-Markdown.

Deze hoeveelheid is voldoende voor catalogus, pathoverzicht, navigatie en
succesbestemming, maar te klein om een parallelle opslagplaats voor wijnkennis
te worden.

### `DEC-LRN-010` — Prerequisites

V1 gebruikt alleen een menselijke, gelokaliseerde
voorkennisbeschrijving. Er komen geen formele prerequisite-relaties, gates of
unlockregels.

Het pilotpad heeft maar één instapniveau en geen aantoonbare behoefte aan een
curriculumgraaf. Een later pad mag pas een formele relatie afdwingen wanneer de
UI er betrouwbaar gedrag mee moet ondersteunen.

## 6. Status- en publicatiegedrag

### Draft

- wordt volledig gevalideerd en mag in de runtimebundle staan;
- verschijnt niet in Learn-catalogus, search, sitemap of publieke suggesties;
- mag naar draftlessons verwijzen voor redactionele ontwikkeling;
- krijgt geen belofte van stabiele gebruikersvoortgang.

### Active

- alle zeven verplichte gelokaliseerde velden zijn compleet;
- bevat minimaal één step en één completion suggestion;
- iedere step verwijst naar een actieve lesson;
- ieder completiontarget is bekend en actief;
- IDs en canonical Engelse slug gelden vanaf dan als stabiel;
- verschijnt in Learn-catalogus en sitemap.

### Deprecated

- verschijnt niet als nieuw aanbod in catalogus, search of sitemap;
- blijft identificeerbaar voor bestaande links en lokale progressrecords;
- vereist vóór implementatie van echt deprecationgedrag een expliciet
  vervangings- of eindstatusbesluit; v1 verwijdert nooit stilzwijgend records.

## 7. Validatiecontract voor `LRN-004`

De pipeline moet ten minste vroeg en met bestandspad falen op:

- onbekende velden of schema-versie;
- ongeldig of dubbel path-ID;
- ongeldige status, levelwaarde, slug of step-ID;
- ontbrekende NL/EN-tekst;
- dubbele slugs per locale of botsing tussen NL- en EN-routes;
- lege steps, objectives, recap of suggestions;
- dubbele step-ID's of dubbele lessontargets binnen één path;
- onbekende targets;
- step-targets die geen narrative van type `lesson` zijn;
- een actief path met niet-actieve step- of completiontargets;
- een completiontarget naar hetzelfde path;
- twee actieve paths die dezelfde canonical route claimen.

`content:build` genereert vervolgens:

- genormaliseerde learning paths in de bestaande runtimebundle;
- lookup op path-ID;
- locale-aware sluglookup;
- reverse membership van lesson-ID naar path- en step-ID;
- uitsluitend voor actieve paths catalogus- en sitemapdata.

Titels, percentages, stepcount en huidige positie blijven afgeleide waarden en
worden nergens als dubbele authored of progressdata opgeslagen.

## 8. Routingcontract

- canonical pathroute: `/learn/<english-slug>`;
- een afwijkende Nederlandse slug redirect permanent naar de canonical route;
- lessons behouden hun bestaande modus-neutrale narrative-URL;
- pathcontext verandert nooit de canonical metadata van een lesson;
- de precieze overdracht van pathcontext wordt pas in `DEC-LRN-011` besloten.

## 9. Authoringworkflow

1. Keur eerst curriculumbrief, lesvolgorde en contentgaps goed.
2. Maak daarna het draftpathpackage met stabiele path- en step-ID's.
3. Maak of selecteer de lessonpackages waarnaar de steps verwijzen.
4. Schrijf pathproza pas nadat doelen, doelgroep en lessonvolgorde vaststaan.
5. Houd naslaglinks in de relevante lesson; kopieer geen entityproza naar YAML.
6. Review NL en EN op betekenis, niet alleen op aanwezigheid.
7. Activeer het path pas wanneer lessons, completiontargets en integrale UX-QA
   gereed zijn.

## 10. Bewust uitgesteld

- accounts, enrollment, cohorts en toegangsrechten;
- formele prerequisites en unlockregels;
- quizzes, scores, certificaten en completionbewijs;
- geschatte of gemeten studieduur;
- optionele branches binnen één path;
- pathversies voor voortgangsmigratie;
- automatische aanbevelingen;
- een database- of API-representatie.

Deze onderwerpen krijgen pas schema-impact wanneer werkelijk gebruik een
concrete productvraag oplevert. `schema_version` en stabiele IDs maken zo'n
latere migratie mogelijk zonder het v1-contract nu vooruit te belasten.

## 11. Definition of done voor het contract

Het contract blijft correct toegepast wanneer:

- `DEC-LRN-008`, `DEC-LRN-009` en `DEC-LRN-010` zijn goedgekeurd;
- dit contract als bindend is gemarkeerd;
- `knowledge-architecture.md`, `project-map.md` en `content-authoring.md` de
  besloten packagevorm, ownershipgrenzen en workflow correct samenvatten;
- de voorbeeldvorm alle zeven pilotlessons en de succesbestemming zonder
  uitzonderingen kan modelleren;
- de implementatietaken voor `LRN-004` volledig uit het contract zijn af te
  leiden zonder nieuwe productbeslissing.
