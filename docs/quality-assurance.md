# Quality assurance en onderhoud

Dit document beschrijft hoe Oenocademy kwaliteitscontroles, bevindingen en
onderhoudsacties over langere tijd traceerbaar houdt. Het is een werkafspraak;
de bindende product-, content- en researchpolicies blijven inhoudelijk leidend.

## Documentstructuur

Het systeem bestaat uit drie lagen:

1. **Reviewrapporten zijn gedateerde momentopnames.** Ze leggen reikwijdte,
   methode, bevindingen en eventuele directe correcties vast. Een afgerond
   rapport wordt inhoudelijk niet herschreven om de actuele stand te tonen.
   Latere verduidelijkingen krijgen een gedateerd addendum.
2. **Het reviewregister hieronder is de chronologische index.** Het maakt
   zichtbaar welke controles zijn uitgevoerd en verbindt ieder rapport met de
   acties die eruit voortkwamen.
3. **`maintenance-backlog.md` is de levende actielijst.** Daar staat wat nog
   open is, wat wordt uitgevoerd en wat is afgerond of bewust vervallen.

```text
kwaliteitscheck
      |
      v
gedateerd reviewrapport -----> reviewregister
      |                              |
      v                              v
actie-ID's -----------------> algemene onderhoudsbacklog
                                      |
                                      v
                           uitvoeringslog + eindstatus
```

Een rapport bewaart dus het antwoord op *wat vonden we toen?* De backlog
beantwoordt *wat is ermee gebeurd en wat staat nog open?*

## Vaste identificatie

- Een review krijgt een ID als `QCR-YYYY-MM-DD-NN`, bijvoorbeeld
  `QCR-2026-09-08-01`.
- Een onderhoudsactie krijgt een permanent ID als `MNT-NNN`.
- Een actie-ID wordt nooit hergebruikt, ook niet nadat de actie is afgerond of
  vervallen.
- Eén bevinding kan meerdere acties opleveren; één actie kan uit meerdere
  reviews voortkomen. Alle relevante review-ID's worden bij de actie genoemd.

## Levenscyclus van een review

1. Leg vóór de controle onderwerp, scope, methode en peildatum vast.
2. Maak een gedateerd rapport met een review-ID.
3. Scheid observaties van concrete acties. Niet iedere observatie hoeft werk op
   te leveren.
4. Registreer ieder actiepunt in de algemene backlog of koppel het aan een
   bestaand actie-ID wanneer het om hetzelfde probleem gaat.
5. Voeg de review toe aan het register en vermeld de bijbehorende actie-ID's.
6. Corrigeer werk dat veilig binnen de review kan worden opgelost direct, maar
   registreer ook die actie als `afgerond` met datum en korte uitvoeringsnotitie.

## Levenscyclus van een onderhoudsactie

Iedere actie heeft minimaal:

- een permanent ID en korte titel;
- status, prioriteit en categorie;
- de concrete bevinding en afgebakende scope;
- herkomst via één of meer review-ID's of `zelfstandig gesignaleerd`;
- een toetsbare voltooiingsvoorwaarde;
- een gedateerd log van relevante besluiten en uitvoering.

De toegestane statussen zijn:

- `open` — erkend, maar nog niet ingepland;
- `gepland` — er is een concrete eerstvolgende uitvoeringsronde;
- `bezig` — uitvoering is aantoonbaar gestart;
- `geblokkeerd` — een benoemde afhankelijkheid verhindert voortgang;
- `afgerond` — de voltooiingsvoorwaarde is gehaald en vastgelegd;
- `vervallen` — bewust niet meer uitvoeren, met reden en datum.

Een actie wordt niet verwijderd wanneer zij is afgerond. Zij verhuist naar het
historische deel van de backlog. Bij een gedeeltelijke oplossing blijft de
actie open of wordt het resterende werk als een nieuw, gekoppeld actie-ID
vastgelegd.

## Vaste controle van gerelateerde onderwerpen

Neem bij iedere contentronde met nieuwe of gewijzigde relaties de afgeleide
blokken ‘Gerelateerde onderwerpen’ mee in de kwaliteitscontrole. Beoordeel niet
alleen de regels in het gewijzigde `entity.yaml`, maar de combinatie van forward
en automatisch afgeleide inverse relaties voor alle betrokken entities.

De minimale acceptatiecriteria zijn:

- iedere verbinding is canoniek eenmaal opgeslagen;
- dezelfde targetentity verschijnt binnen een zichtbare, gelokaliseerde groep
  maximaal eenmaal;
- de groepsnaam beschrijft de relatie inhoudelijk juist;
- `npm run content:check` slaagt, omdat deze check ook spiegelrelaties en andere
  duplicaten controleert die pas na afleiding zichtbaar worden.
- `npm run content:relation-audit` slaagt voor de structurele ondergrens van alle
  actieve entities.

De relation-audit is nadrukkelijk geen vervanging voor redactionele beoordeling.
Controleer in contentbrief en publicatiereview ook of de relevante parent,
belangrijke druiven, producenten, classificaties en inhoudelijke verbindingen
voor dit onderwerp werkelijk zijn gemodelleerd. Een technisch geldige graaf kan
immers niet signaleren wat nooit als kandidaat-relatie is vastgelegd.

Controleer bij een gerichte correctie daarnaast de volledige relatiegrafiek,
niet alleen de pagina waarop de doublure als eerste is opgemerkt. Leg bredere
bevindingen volgens de normale review- en backlogstructuur vast wanneer ze niet
binnen dezelfde ronde veilig kunnen worden opgelost.

## Prioriteit en categorieën

Prioriteit drukt gevolg en urgentie uit, niet de geschatte hoeveelheid werk:

- `hoog` — vertrouwen, juistheid, toegankelijkheid of een kernervaring wordt
  merkbaar geraakt;
- `middel` — duidelijke kwaliteitswinst, maar geen actuele blocker;
- `laag` — nuttige verfijning of werk dat logisch met een latere fase meeloopt;
- `afhankelijk` — prioriteit wordt pas uitvoerbaar na een expliciete
  platform- of datacapability.

Gebruik waar mogelijk een van deze categorieën: `content`, `research`, `media`,
`knowledge-data`, `product-ux`, `accessibility`, `atlas-gis`, `engineering`,
`testing` of `operations`. Meerdere categorieën zijn toegestaan wanneer dat de
werkelijke scope beter weergeeft.

## Reviewregister

Nieuwste review eerst.

| Review-ID | Datum | Type en scope | Rapport | Resultaat | Acties |
| --- | --- | --- | --- | --- | --- |
| `QCR-2026-09-22-02` | 2026-09-22 | Volledige herbouw phylloxera, franc de pied, relaties en wortelbeeld | [Phylloxera- en franc-de-piedreview 2026-09-22](../editorial/phylloxera-content-review-2026-09-22.md) | Wortelbiologie, crisis, enten, blijvende gevolgen en phylloxeravrije contexten volledig NL/EN; zelfstandige franc-de-piedentity en Liber Pater-draft toegevoegd | `MNT-038` afgerond |
| `QCR-2026-09-22-01` | 2026-09-22 | Defensieve formuleringen in alle 263 actieve packages en 526 lokalisaties | [Audit defensieve formuleringen 2026-09-22](../editorial/defensive-language-audit-2026-09-22.md) | Positieve-herformuleringstest ingevoerd, herhaalbare inventaris toegevoegd en dichtste patronen in tien tweetalige packages herschreven | `MNT-037` afgerond |
| `QCR-2026-09-20-01` | 2026-09-20 | Bronactualiteit Bordeaux-specificatie tijdens Clairet/Claret-authoring | [Bordeaux-specificatie bronreview 2026-09-20](../editorial/bordeaux-specification-source-review-2026-09-20.md) | Definitieve 2026-tekst voor nieuwe pagina's geregistreerd; corpusbrede 2025-verwijzingen vragen claimgewijze controle | `MNT-031` open |
| `QCR-2026-09-13-01` | 2026-09-13 | Volledigheid en presentatie van gerelateerde onderwerpen op alle 81 actieve entities | [Audit gerelateerde onderwerpen 2026-09-13](../editorial/related-knowledge-audit-2026-09-13.md) | Structurele dekking schoon; compact semantisch clusterontwerp en herhaalbare audit ingevoerd | `MNT-012`, `MNT-028`, `MNT-029` afgerond; `MNT-030` open |
| `QCR-2026-09-09-03` | 2026-09-09 | End-to-end Pomerol-producentenpilot, Pétrus en schaalbare Ontdekken-pagina | [Pomerol-producentenpilot 2026-09-09](../editorial/pomerol-producer-pilot-review-2026-09-09.md) | Acht actieve collectieprofielen, één nieuwe monografie en een begrensde categorie-ingang | `MNT-023` afgerond |
| `QCR-2026-09-09-02` | 2026-09-09 | Volledige migratie van 129 producentenrecords en alle contentplannen | [Producentenpresentatiemigratie 2026-09-09](../editorial/producer-presentation-migration-2026-09-09.md) | 11 monografieën, 29 collectieprofielen en 89 registervermeldingen; geen legacy-defaults | `MNT-022`, `MNT-024` afgerond |
| `QCR-2026-09-09-01` | 2026-09-09 | Architectuur- en schaalreview van 129 producentenrecords | [Producentenarchitectuur-review 2026-09-09](../editorial/producer-architecture-review-2026-09-09.md) | Drie publicatievormen ingevoerd; Pomerol als planningspilot; legacy-migratie vastgelegd | `MNT-021` t/m `MNT-024` |
| `QCR-2026-09-08-01` | 2026-09-08 | Content-health-review van alle 23 actieve entities | [Content-health-audit 2026-09-08](../editorial/content-health-audit-2026-09-08.md) | 14 open vervolgacties; 5 correcties direct afgerond | `MNT-001` t/m `MNT-019` |

## Sjabloon voor toekomstige reviewrapporten

```markdown
# <naam kwaliteitscheck> — <YYYY-MM-DD>

Review-ID: `QCR-YYYY-MM-DD-NN`

## Reikwijdte en methode

<wat, waarom, peildatum, gebruikte checks en expliciete beperkingen>

## Samenvatting

<belangrijkste uitkomst>

## Bevindingen

<bewijs en observaties, ook wanneer daar geen actie uit volgt>

## Direct gecorrigeerd

<uitgevoerd werk met MNT-ID's, of “Geen”>

## Vervolgacties

<MNT-ID's met korte omschrijving; de actuele status leeft uitsluitend in de backlog>

## Addenda

<alleen latere feitelijke verduidelijkingen, gedateerd en zonder de oorspronkelijke bevinding te wissen>
```
