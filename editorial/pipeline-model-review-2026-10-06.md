# Pipeline en model: modulegrenzen — 2026-10-06

Review-ID: `QCR-2026-10-06-02`  
Actie: `MNT-048`  
Uitgangspunt: commit `02fa208` (`feat: implement i18n`), schone werkboom.

## Reikwijdte en methode

Gedragsbehoudende opsplitsing van de contentpipeline en het model, vóór verdere
content- en schema-uitbreiding. De bestaande publieke imports blijven geldig.
Canonical YAML, Markdown, media, UI en dependencies vallen buiten de wijziging.
De kennisbundel is vóór de wijziging opnieuw opgebouwd en na de wijziging
byte voor byte vergeleken. Bestaande fixturetests zijn ongewijzigd uitgevoerd.

## Moduleverdeling

| Ingang | Verantwoordelijkheid |
| --- | --- |
| `scripts/content/pipeline.ts` | 48 regels: laden, valideren, graph afleiden en optioneel schrijven; bestaande opties en exports |
| `pipeline/files.ts` | Gesorteerde discovery, YAML/schema-invoer, mediabytes/checksums en outputbestanden |
| `pipeline/validation.ts` | Bestaande cross-record validatievolgorde en samenhang |
| `pipeline/documents.ts` | Localebestanden, Markdown, publicatiestructuur, mentions en producentenpresentaties |
| `pipeline/plans.ts` | Coverage, sectiekoppen, evidence en dependencies uit contentplannen |
| `pipeline/relations.ts` | Duplicaten in de uiteindelijke gelokaliseerde relatiepresentatie |
| `pipeline/graph.ts` | Deterministische normalisatie, relaties, backlinks en lookups |
| `pipeline/search.ts` | Zoekmetadata en gelokaliseerde passages; tekstextractie gedeeld via `content-text.ts` |
| `pipeline/diagnostics.ts`, `types.ts` | Bestaande foutteksten/duplicatechecks en kleine fasecontracten |
| `src/content/model.ts` | 92 regels met dezelfde publieke schema-, constante- en type-exports |
| `src/content/model/` | Acht modules: common, documents, entities, narratives, learning paths, provenance, content plans en generated vormen |

De modelmodules gebruiken directe imports en niet hun eigen publieke ingang.
Er is geen nieuwe inhoudelijke abstractielaag of schema toegevoegd. De
gegenereerde runtimevormen blijven gescheiden van het authored contentplan.

## Server- en clientgrens

De contentrepository importeert `server-only`. Next.js weigert daardoor ook
indirecte clientimports via een andere module. Een ESLint-regel staat directe
imports van `src/generated/content/` alleen toe in die repository, inclusief
re-exports, dynamische imports en `require` met letterlijke paden. De regel
normaliseert relatieve, absolute en `@/`-paden en draait in de bestaande check/CI.
Clientcomponenten ontvangen kleine geserialiseerde resultaten als props.

Vitest vervangt uitsluitend in zijn eigen configuratie de marker door een lege
module: deze tests draaien in Node. De productiebuild gebruikt de echte
Next.js-grens. Een geïsoleerde kopie is daarnaast gebouwd met een pagina die
via een tussenmodule de repository leest: de servervariant slaagt, dezelfde
pagina met `use client` wordt op `server-only` geweigerd.

## Verificatie

- Alle **94 oorspronkelijke modeldeclaraties** zijn tokengewijs gelijk, afgezien
  van exportmodifiers en formatting. De publieke runtime-exportlijst is gelijk.
- Alle 18 nieuwe pipeline-/modelmodules zijn op interne importcycli gecontroleerd;
  er zijn geen cycli gevonden.
- De volledige kennisbundel is **byte-identiek**. SHA-256 vóór en na:
  `2ebae40c635a009614b922ef2de4e552f44e5d76ee573bb132320b085dc72989`.
- De bundle bevat nog 353 entities, 8 narratives, 1 learning path, 181 mediarecords
  en 1.296 forward relations, inclusief draft/deprecated records waar toepasselijk.
- `npm run format` en `npm run check` slagen: **148 tests**, waaronder de bestaande
  138 tests en tien nieuwe tests voor de importgrens. De bestaande fixturetests
  bewaken validatiefouten, publicatie, plans, graph en deterministische output.
- `next build --webpack` en de volledige Playwright-suite slagen: **117 tests**,
  inclusief zoeken, locale-/queryrouting, anchors, Learn, no-JS en mobiele UI.

Dit is geen nieuwe feitelijke contentreview of performancemeting. Externe CI en
deployment zijn niet opnieuw geverifieerd; zij blijven bij `MNT-056`.

## Vervolg

`MNT-048` is afgerond. `EXP-020` is de volgende ontwikkeltaak: de bestaande
`concept.elevage` wordt de systeemhub voor opvoeding, zuurstof en rijping, met
behoud van de eigen mechanismen bij MLF, liesrijping, bâtonnage, autolyse,
oxidatie en assemblage. De [productplanning](../docs/product-roadmap.md) telt
nog 21 tickets. Er zijn geen nieuwe onderhoudstickets nodig voor deze opsplitsing.
