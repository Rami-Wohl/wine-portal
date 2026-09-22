# Triageworkflow Markdown-linkaudit — 2026-09-22

Review-ID: `QCR-2026-09-22-06`

## Reikwijdte en methode

Deze review rondt `MNT-030` af voor `npm run content:link-audit` en de volledige
actieve contentcorpus. De oorspronkelijke audit gaf iedere mogelijke gemiste
entitylink als één platte tekstregel. Daardoor waren nieuwe bevindingen,
herhaling, homoniemen en bewuste niet-links niet van elkaar te onderscheiden.

De audit is herbouwd rond gestructureerde kandidaten met een stabiele identiteit:

```text
<document-id>:<locale>-><target-id>
```

De exacte gevonden term blijft onderdeel van de actuele audituitvoer. De
duurzame baseline en menselijke besluiten staan in
`editorial/link-audit-decisions.yaml`.

## Geïmplementeerde workflow

- De standaardrun schrijft niets en rapporteert `new`, `pending`, `link`,
  `skip`, `false-positive` en niet langer actieve registerregels afzonderlijk.
- `--sync` voegt uitsluitend nieuwe kandidaat-ID's als pending aan de baseline
  toe en bewaart bestaande besluiten.
- `--status=<status>` toont één gerichte werkqueue; `--all` kan de standaard
  nieuwe en link-queues volledig uitklappen.
- `skip` en `false-positive` vereisen een reviewdatum en motivatie; `link`
  vereist een reviewdatum.
- Ongeldige statussen, dubbele IDs, besluiten buiten de baseline en onvolledige
  motivaties falen vroeg met een gerichte validatiefout.
- Geen enkele auditmodus schrijft prose-links of graafrelaties.

## Baseline op 22 september 2026

De huidige corpus levert 768 kandidaten op. Zij zijn eenmalig als `pending`
geregistreerd:

| Queue | Aantal |
| --- | ---: |
| Nieuw | 0 |
| Pending | 768 |
| Link | 0 |
| Skip | 0 |
| False-positive | 0 |
| Niet langer actief | 0 |

Dit is bewust geen inhoudelijk oordeel over 768 vermeldingen. Het is de
traceerbare uitgangspositie waardoor iedere volgende corpuswijziging nieuwe
kandidaten onmiddellijk zichtbaar maakt en redactionele beslissingen niet meer
in losse notities verdwijnen.

## Schaalkeuze

Een eerste prototype schreef alle document-, taal-, target- en termvelden voor
iedere kandidaat uit en groeide tot meer dan 5.000 regels. Dat ontwerp is vóór
publicatie vervangen. Het definitieve register bewaart één baseline-ID per
kandidaat en schrijft alleen volledige metadata voor menselijke besluiten. De
actuele context wordt deterministisch uit het corpus afgeleid. Daardoor blijft
het register lineair en compact zonder informatie voor triage te verliezen.

## Validatie

- Unit-tests dekken nieuwe, pending, beoordeelde en inactieve kandidaten.
- Een synctest bewijst dat bestaande besluiten behouden blijven.
- Een validatietest verwerpt een skipbesluit zonder motivatie.
- De volledige corpusrun levert na sync 0 nieuwe en 768 pending kandidaten.
- Formatter, lint, typecheck, volledige testsuite, contentvalidatie en
  relation-audit moeten bij afronding slagen.

## Resultaat

`MNT-030` is afgerond. De audit blijft een menselijke beslisondersteuning en
wordt geen automatische contentmutatie. De 768 pending kandidaten vormen
redactionele werkvoorraad, geen publicatiefouten en geen nieuwe afzonderlijke
onderhoudstickets.
