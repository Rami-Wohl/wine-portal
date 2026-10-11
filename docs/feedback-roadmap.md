# Correcties en suggesties

Peildatum: 2026-10-11. Herkomst: gebruikersbrief van 2026-10-11.
Status: voorgesteld productcontract en open uitvoeringsbacklog; geen gelanceerde
functie of gekozen provider. Dit is de enige statusadministratie voor `FBK-*`
en `DEC-FBK-*`. De [productroadmap](product-roadmap.md) bepaalt de samenhang.

## Featurebrief

Oenocademy laat ingelogde lezers een fout, onduidelijke uitleg, vertaalprobleem,
defect of algemene suggestie melden. Een melding hoort bij een herkenbare
pagina of sectie en bewaart de gelezen contentversie. De redacteur beoordeelt
de melding, onderzoekt feitelijke claims en koppelt een begrijpelijke uitkomst
terug. Gebruikers wijzigen canonical kennis nooit rechtstreeks.

De primaire gebruiker is een NL- of EN-lezer die tijdens het lezen iets wil
verbeteren. De tweede gebruiker is de beheerder die meldingen veilig groepeert,
beoordeelt en omzet in gecontroleerde correcties of uitvoerbaar werk.

Succes betekent: een reeds ingelogde lezer kan met de benodigde informatie
binnen 30 seconden indienen; de flow werkt met toetsenbord en zonder JavaScript;
iedere beslissing is traceerbaar; gebruikers krijgen een uitkomst en kunnen
eenmalig aanvullende informatie geven. Toets dit met handmatige taakproeven,
zonder een analyticsplatform toe te voegen. Publicatie vereist werkende
misbruikbeperking, privacyrechten en menselijke redactionele review.

Publieke reacties, beoordelingen, gamification, automatisch publiceren,
een tweede kennisbank en een migratie van wijncontent naar de database vallen
buiten scope. Voortgangssynchronisatie volgt pas in fase 3.

## Gecontroleerde uitgangspunten en expliciete aannames

- De huidige code heeft een server-only contentrepository en één gegenereerde
  bundle. `GeneratedKnowledgeBase` heeft nog geen build-ID; `ContentBlock`
  nog geen hash. Beide worden **afgeleide** metadata, geen authored velden.
- Blockidentiteit is `<package-id>#<block-id>` en gelijk in NL/EN. Een hash is
  **per locale**: gelijke identiteit betekent geen gelijke tekst of hash.
- Depth en bronnen zijn optioneel in het huidige blockmodel. De feedbackflow
  mag geen verplichte waarden verzinnen voor blocks die ze niet hebben.
- Entities en narratives hebben blocks. Learning paths zijn YAML-routes zonder
  eigen Markdownblocks; daarvoor geldt paginagerichte of algemene feedback.
  Embedded producenten richten sectiemeldingen op het werkelijke owner-block.
- Er is nog geen account-/feedbackdatabase. De bestaande async
  `LearningProgressRepository` heeft `load`, `save`, `clear`, `subscribe` en
  versieerbare records; fase 3 bewaart dat contract.
- **Ontwerpaanname:** één hosted Postgres voor private gebruikersdata, in een
  gekozen EU-regio. Provider, contracten, kosten en regio zijn nog niet besloten.
  Canonical wijnkennis blijft file-backed; geen nieuwe publieke REST-API nodig.
- **Privacycorrectie op de brief:** alleen e-mail als verplicht profielgegeven
  betekent niet dat alleen e-mail persoonsgegevens is. Meldtekst, citaten,
  bron-URLs, accountkoppelingen en beveiligingsmetadata kunnen dat ook zijn.
  Een gehashte IP-sleutel wordt niet als anoniem beschouwd.
- **Fasegrens:** fase 1 heeft een privé-ontvangst/detailpagina voor de eigen
  melding en één antwoordronde. De overzichtspagina “Mijn meldingen” volgt in
  fase 2. Acceptatie gebruikt eerst handmatig gekoppeld, geredigeerd werk;
  automatische GitHub-aanmaak volgt in fase 2.
- **Uitkomst versus wijziging:** een gewijzigde blockhash bewijst alleen een
  andere contentversie. Hij bewijst geen oplossing en vervangt geen menselijke
  beslissing. Het wijzigingssignaal staat naast de behandelstatus.
- **Misbruik:** een inhoudelijke afwijzing is geen strike. Waarschuwingen en
  bans volgen alleen uit menselijk bevestigde misbruikbeslissingen. De
  misbruikuitkomst verstuurt geen mail; waarschuwingen zijn in het account
  zichtbaar. Deze interpretatie vraagt besluit `DEC-FBK-007`.

Het privacykader baseert zich op de officiële EDPB-uitleg over
[dataminimalisatie en opslagbeperking](https://www.edpb.europa.eu/sme/learn-the-basics/data-protection-basics_en)
en [rechten van betrokkenen](https://www.edpb.europa.eu/sme/find-practical-info/faq_en?page=1).
De voorgestelde termijnen hieronder zijn productkeuzes, geen wettelijke
standaardtermijnen. Rechtsgrond, verwerkers, doorgiften en uitzonderingen moeten
vóór lancering specifiek worden beoordeeld in `FBK-005`.

## Beslisregister

Alle besluiten zijn **open**. “Voorkeur” is een aanbeveling, geen goedkeuring.
Leg bij sluiting eigenaar, datum, onderbouwing en eventuele afwijking vast.
Een implementatieticket start pas nadat zijn beslisafhankelijkheden zijn gesloten.
FBK-004/005 werken juist de genoemde besluiten uit; hun uitkomst is een gate
voor de volgende fase, geen circulaire startvoorwaarde voor het onderzoek zelf.

| ID | Besluit en waarom het blokkeert | Voorkeur | Alternatieven |
| --- | --- | --- | --- |
| `DEC-FBK-001` | Passwordless methode; blokkeert FBK-007/008 | E-mailmagiclink met eenmalig, kort geldig token en geverifieerd adres; publieke leesroutes blijven anoniem | Passkey met afzonderlijk geverifieerd e-mailadres; geen eigen wachtwoordenstelsel |
| `DEC-FBK-002` | Authprovider, onderhoud en sessiebeheer; blokkeert FBK-006/007 | Onderhouden oplossing met server-side autorisatie, intrekbare sessies, export/verwijdering en bewezen no-JS-flow; eerst een gerichte proef, daarna providerbesluit | Auth.js, een onderhouden opvolger zoals Better Auth, Clerk of Supabase Auth; verwerkers-/regiotoets verplicht, geen keuze op naam alleen |
| `DEC-FBK-003` | Databaseprovider/regio, pooling, backup en herstel; blokkeert FBK-006 en MNT-050 | Eén hosted Postgres in expliciet gekozen EU-regio, ook voor latere Learn-data; gedocumenteerde export en restore | Andere hosted EU-Postgresaanbieder; eigen beheer alleen met aantoonbare operationele capaciteit |
| `DEC-FBK-004` | Mailprovider en bezorg-/retentiecontract; blokkeert FBK-007/010 | Eén transactionele provider voor login en uitkomsten, met retries, webhookauthenticatie, suppression en minimale logging; kiezen na bezorg-/privacyproef | Onder meer Resend of Postmark; EU-dataverwerking en doorgiften per dienst controleren |
| `DEC-FBK-005` | Beheerlocatie en rechten; blokkeert FBK-009/016 | Rolbeveiligde route in dezelfde app, bijvoorbeeld `/beheer`; server controleert iedere read en write | Afzonderlijke beheerapp, alleen bij concrete isolatiebehoefte |
| `DEC-FBK-006` | Bewaartermijnen en verwijderketen; blokkeert FBK-005/022–024 | Voorstel: body/quote/bron/reply tot 180 dagen na sluiting, open meldingen na 180 dagen herbeoordelen; mailmetadata 30 dagen, securitysleutels maximaal 24 uur, besluiten/strikes/audit maximaal 12 maanden met minimale payload; backups maximaal 30 dagen | Kortere termijnen; langere alleen met gedocumenteerd doel/rechtsgrond en periodieke toets. Geen oneindige append-only persoonsgegevens |
| `DEC-FBK-007` | Strikebeleid en beroep; blokkeert FBK-020/021 | Voorstel: waarschuwing bij 2 en 4, ban bij 6 bevestigde strikes in 180 dagen; omkeerbaar, beroep mogelijk, in-account waarschuwingen; afwijzingen tellen niet mee | Andere gemotiveerde drempels/venster; menselijke escalatie bij ernstige aanval. Geen ban op enkel AI-score of afwijspercentage |
| `DEC-FBK-008` | Eerste inzending/accountleeftijd; blokkeert FBK-014 | Direct na e-mailverificatie, met gelijke conservatieve limieten; geen wachttijd of reputatievoorwaarde | Korte wachttijd bij aantoonbare aanval; expliciet heroverwegen in plaats van stilzwijgend invoeren |
| `DEC-FBK-009` | Acceptatie → werk en veilig GitHubgebruik; blokkeert FBK-018/031 | Eén bestaand/nieuw MNT-ticket voor onderhoud, EXP/LRN/REG voor domeinwerk; GitHub issue is uitvoeringsverwijzing, geen tweede statuswaarheid. Mens publiceert uitsluitend zelfstandig geformuleerde, geanonimiseerde probleemsamenvatting | Alleen GitHub als werkadministratie na expliciete aanpassing van het backlogcontract. Private report-ID's, accountdata en letterlijke inzendingen blijven buiten Git |
| `DEC-FBK-010` | Contributor credit versus minimaal profiel; blokkeert FBK-030 | Afzonderlijke, intrekbare opt-in per correctie met optionele publieke alias in database; nooit e-mailadres publiceren | Geen credit, of collectief “met dank aan lezers”. Bij vasthouden aan uitsluitend e-mail als profieldata blijft individuele credit uit |
| `DEC-FBK-011` | Versioneringscontract; blokkeert FBK-003/011/028 | Versieerbare SHA-256 over deterministische, gelokaliseerde blockinhoud plus relevante bron-/mediametadata; bundle-ID over volledige deterministische bundle zonder eigen manifest-ID | Hash over alleen AST, met expliciet geaccepteerde blinde vlekken; deployment-ID apart. Geen kloktijd of Git-SHA als enige contentidentiteit |
| `DEC-FBK-012` | Statusmatrix, “open” en gewijzigd-signaal; blokkeert FBK-014/017–019/028 | Open = ontvangen/in behandeling/meer informatie nodig; acceptatie is een teruggekoppelde uitkomst met werklink. Hashwijziging is een onafhankelijk signaal; alleen review mag “opgelost” verklaren | Acceptatie open houden tot levering: vereist andere uniciteits-/sluitregels. Nooit automatisch een melding opgelost noemen op basis van een hash |
| `DEC-FBK-013` | AI bij triage en gegevensdeling; blokkeert eventuele AI-uitvoering | Handmatige triage bij lancering; AI nooit bron, reviewer of beslisser. Geen inzendingen naar een modelprovider zonder apart privacy-/verwerkersbesluit | Later alleen classificatie, duplicatekandidaten en conceptantwoord onder menselijke review; geen AI-ticket in deze eerste uitvoeringsset |
| `DEC-FBK-014` | Limieten, replydeadline en reactietijd; blokkeert FBK-001/012–015/017 | Voorstel: 30–4000 tekens body, 1000 quote, 2000 bronreferentie, maximaal 5 links en 16 KiB request; 5 meldingen/uur en 20/dag per gebruiker; IP-plafond met ruimte voor gedeelde netwerken. Eén reply binnen 14 dagen; streefreactie 5 werkdagen alleen na capaciteitstoets | Andere meetbare limieten/deadlines; geen beloofde SLA zonder beheerdercapaciteit |
| `DEC-FBK-015` | Correctierecord en publicatiebridge; blokkeert FBK-019/029 | Private koppeling report → redactioneel record. Canonical wijziging via normale gitreview; record bewaart oud/nieuw begrip, bronnen, datum, reviewer en rebuild/retranslation. Publieke projectie bevat alleen goedgekeurde redactionele feiten | Bestaand reviewrecord hergebruiken als het alle velden heeft; precieze storagekeuze in MNT-050. Meldtekst is geen bron |
| `DEC-FBK-016` | Privacygrondslag, doelgroep, verantwoordelijke en leveranciers; blokkeert FBK-002/005 en publieke lancering | Benoem verantwoordelijke/contact, doeleinden/rechtsgrond per verwerking, doelgroep-/leeftijdsbeleid, verwerkers en doorgiften; afzonderlijke credittoestemming | Andere onderbouwde inrichting na privacyreview. Een EU-databaseregio alleen sluit andere doorgiften niet uit |
| `DEC-FBK-017` | Betrouwbare achtergrondtaken en incidentgedrag; blokkeert FBK-010/022–024/028/031 | Postgres-outbox met unieke eventkeys plus geauthenticeerde scheduler/worker, retries en monitoring zonder reportbody; pauzeknop voor inzendingen en uitgaande mail | Beheerde queue na behoefte-/kostenbewijs; niet vertrouwen op werk na het beëindigen van een serverless response |
| `DEC-FBK-018` | Botchallenge, toegankelijkheid en no-JS; blokkeert FBK-008 en lancering | Provider/control-combinatie eerst door volledige no-JS-loginproef halen; gelijkwaardige toegankelijke serverflow met challenge en limieten | Andere provider/challenge; als geen equivalente route haalbaar is, scopebesluit nodig en lancering geblokkeerd. Een JS-widget verbergen is geen fallback |
| `DEC-FBK-019` | Learn-sync, merge en offlineconflicten; blokkeert publieke activatie FBK-033/034 | Expliciete keuze vóór eerste upload, bestaande adapter behouden; versieconflicten en reset/reopen bewust behandelen, lokale voortgang behouden bij annuleren | Eenmalige import of accountversie kiezen met begrijpelijke gevolgen; geen stilzwijgende union die een reset ongedaan maakt |

Auth.js noemt zelf een migratiepad en adviseert bij nieuwe projecten Better Auth;
daarom is Auth.js hier geen automatisch voorkeursbesluit. Zie de
[officiële migratiehandleiding](https://authjs.dev/getting-started/migrate-to-better-auth).
Dit bewijst nog geen geschiktheid van een alternatief voor onze no-JS-,
Next.js-, privacy- of beheervereisten; daarvoor bestaat `FBK-004`.

## Ticketcontract en fasering

34 tickets: fase 0 vijf, fase 1 twintig, fase 2 zes, fase 3 drie. Alle staan
**open**, inclusief werk met onbesloten afhankelijkheden; niets is hiermee
stilzwijgend gestart. Ieder ticket is gericht op circa 1–3 ontwikkel-/reviewdagen
na vrijgave. Externe contract- of legalwachttijd valt daarbuiten. Blijkt de slice
groter, splits hem met nieuwe permanente IDs vóór uitvoering.

Herkomst voor ieder ticket: gebruikersbrief 2026-10-11. Eerste log voor ieder
ticket: 2026-10-11 — zelfstandig geregistreerd; scope en gates hieronder.
Voeg latere uitvoering aan het eigen ticket toe; kopieer status niet naar MNT.

Policycodes in ieder ticket verwijzen naar bindende documenten:
**P** [product](product-principles.md), **K** [kennisarchitectuur](knowledge-architecture.md),
**B** [blocks](content-blocks.md), **V** [vorm/toegankelijkheid](visual-language.md),
**R** [research/correcties](../editorial/research-policy.md),
**W** [schrijfstijl](../editorial/writing-style.md),
**L** [NL/EN-routing](localization-routing.md).
Privacybesluiten `DEC-FBK-006/016` gelden daarnaast voor iedere slice die
gebruikersgegevens verwerkt. Geografische correcties volgen aanvullend
[geography-policy.md](geography-policy.md).

### Fase 0 — afbakenen en voorbereiden, zonder productiedatabase

### `FBK-001` — Productflow en toetsbare copy vastleggen

- **Status:** open; **prioriteit:** hoog; **categorieën:** product-ux, accessibility.
- **Scope:** brief concretiseren naar NL/EN-flow; **doel:** snel melden met herkenbare context.
- **Werk:**
  - Werk vijf minimale formulieren, bevestiging, context en responsverwachting uit.
  - Maak keyboard/mobile/no-JS-taakproef en menselijk status-/redenwoordenboek.
- **Klaar wanneer:** goedgekeurde flow de vijf soorten, bronplicht, één reply en fout/lege states toont; tijdmeting start na login met bron paraat; geen interne IDs in copy.
- **Afhankelijkheden:** DEC-FBK-012/014.
- **Buiten scope:** werkende accounts, analytics, publiceren van feedback.
- **Policies:** P, V, R, W, L.
- **Verificatie:** handmatige walkthrough NL/EN; accessibility- en no-JS-ontwerpreview; unit/e2e bij implementatieslices.

### `FBK-002` — Feedbackregels en juridische pagina's voorbereiden

- **Status:** open; **prioriteit:** hoog; **categorieën:** product-ux, operations.
- **Scope:** NL/EN-concepten voor feedbackbeleid, privacy en voorwaarden; **doel:** begrijpelijke afspraken vóór gegevensinname.
- **Werk:**
  - Beschrijf bronnen, beoordeling, afwijzing, waarschuwingen, bans, beroep en rechten.
  - Benoem dataverwerking, termijnen en contact; markeer onbesloten leveranciers/grondslag als draft, niet als ingevulde feiten.
- **Klaar wanneer:** teksten tegen besloten beleid zijn gereviewd, concept/publicatiestatus is expliciet en geen publieke nalevingsclaim ontbrekende review verbergt.
- **Afhankelijkheden:** FBK-001; DEC-FBK-006/007/016. Credit blijft expliciet uit zolang DEC-FBK-010 open is; dit blokkeert de fase-1-teksten niet.
- **Buiten scope:** zelfbedachte juridische zekerheid, marketingmail.
- **Policies:** P, V, R, W, L.
- **Verificatie:** handmatige product-/privacyreview; NL/EN-pariteit, toegankelijke leesstructuur; no-JS/e2e bij publicatie in FBK-025.

### `FBK-003` — Deterministische contentversies genereren

- **Status:** open; **prioriteit:** hoog; **categorieën:** knowledge-data, engineering, testing.
- **Scope:** pipeline, generated types en repository; **doel:** exact herkennen welke gelokaliseerde sectie is gelezen.
- **Werk:**
  - Voeg versioneringsmanifest/build-ID en locale-blockhashes toe volgens DEC-FBK-011, uitsluitend gegenereerd.
  - Dek entity/narrative, figures, embedded owners, ontbrekende depth en gewijzigde/verwijderde blocks af; behoud stabiele IDs en bestaande routes.
- **Klaar wanneer:** gelijke inputs byte-identieke IDs/hashes geven; tekst-/relevante bron-/mediawijziging betrokken hash verandert; NL-wijziging EN-hash niet ongemerkt vervangt; code-only deployment verandert content-ID niet.
- **Afhankelijkheden:** DEC-FBK-011.
- **Buiten scope:** feedbackdatabase, nieuwe authored velden, rapporten opslaan in Git.
- **Policies:** P, K, B, R.
- **Verificatie:** unit/pipelinefixtures, hashversie-migratiecases, npm run check, 1×-benchmark; e2e voor repository/renderingintegratie; geen nieuwe UI om accessibility/no-JS te testen.

### `FBK-004` — Auth-, mail- en botkeuzes met kleine proef besluiten

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, accessibility.
- **Scope:** geïsoleerde synthetische proef en providerbesluit; **doel:** uitvoerbare combinatie kiezen.
- **Werk:**
  - Vergelijk onderhoud, server/no-JS-login, verified e-mail, sessie-intrekking, botchallenge, export/deletion en bezorging.
  - Leg regio, verwerkers, kosten, testomgeving en exitpad vast; gebruik geen echte gebruikersdata in de proef of repo.
- **Klaar wanneer:** DEC-FBK-001–005/017/018 met onderbouwing zijn gesloten, volledige no-JS-proef slaagt en MNT-050 een beoordeelbare infrastructuurkeuze heeft.
- **Afhankelijkheden:** FBK-001; conceptprivacyrandvoorwaarden DEC-FBK-006/016 als input. De definitieve besluiten worden in FBK-005 getoetst; MNT-050 sluit vóór FBK-006.
- **Buiten scope:** productielancering, providerabonnement automatisch afsluiten, canonical opslagmigratie.
- **Policies:** P, K, V, L.
- **Verificatie:** handmatige provider-/contractreview, synthetische integratieproef, keyboard en no-JS; geïsoleerde secrets buiten Git.

### `FBK-005` — Privacy- en operationele vrijgave vastleggen

- **Status:** open; **prioriteit:** hoog; **categorieën:** operations, engineering.
- **Scope:** datainventaris, rechten-/retentie-/herstelrunbook; **doel:** veilig kunnen starten en stoppen.
- **Werk:**
  - Toets rechtsgrond, doelgroep, verantwoordelijke, verwerkers, transfers, cookies/logs en noodzaak van aanvullende privacybeoordeling.
  - Leg termijnen, backupverwijdering, incidentcontact, toegang en publicatiecheck vast; sluit de fase-0-besluiten met eigenaar/datum.
- **Klaar wanneer:** inventaris ook vrije tekst, IP-sleutels, providers en audit omvat; beslisregister heeft geen open fase-1-gates; privacy-/operationele review is traceerbaar.
- **Afhankelijkheden:** FBK-001/002/004; DEC-FBK-006/007/008/009/012/013/014/015/016.
- **Buiten scope:** aannemen dat EU-hosting volledige naleving bewijst.
- **Policies:** P, K, R.
- **Verificatie:** handmatige privacy-/dreigings-/herstelreview; testplan voor bewaartermijnen en rechten; geen publieke UI in deze slice.

Fase-1-gate: FBK-001–005 en MNT-050 afgerond. Geen echte inzendingen of
publieke accountaanmelding vóór FBK-025. Fase 1 kan in staging worden opgebouwd.

### Fase 1 — accounts, melden, menselijke beoordeling en rechten

### `FBK-006` — Private database en servergrens aansluiten

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations.
- **Scope:** versieerbare migrations en server-only toegang; **doel:** gebruikersdata apart van wijnkennis opslaan.
- **Werk:**
  - Bouw minimale tabellen/constraints, pooling en runtimevalidatie; scheid staging/productie en secrets.
  - Oefen migration/rollback en restore met synthetische data; voorkom bodies/tokens in logs.
- **Klaar wanneer:** constraints ongeldige verwijzingen weren; database-uitval content lezen niet breekt; restore slaagt; geen private data in repo/build/static responses.
- **Afhankelijkheden:** FBK-005, MNT-050; DEC-FBK-002/003/006/015/017.
- **Buiten scope:** canonical content naar Postgres, Learn-tabellen zonder consumer.
- **Policies:** P, K.
- **Verificatie:** DB-integratie/constrainttests, handmatige restore en leakcheck; bestaande content-e2e; accessibility/no-JS via latere UI-slices.

### `FBK-007` — Geverifieerde passwordless login leveren

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, product-ux, accessibility.
- **Scope:** login, verificatie, sessie en logout; **doel:** echte accountgebonden inzendingen.
- **Werk:**
  - Integreer gekozen auth/mailer met veilige cookies, expiratie, eenmalige tokens en same-origin returnpad.
  - Geef NL/EN ontvangst-/foutstates zonder accountenumeratie; trek sessies in bij blokkade/verwijdering.
- **Klaar wanneer:** onverified/expired/replayed tokens geen toegang geven; uitloggen en intrekken werken; login inclusief terugkeer werkt zonder JS; publieke kennis blijft anoniem leesbaar.
- **Afhankelijkheden:** FBK-006; DEC-FBK-001/002/004/018.
- **Buiten scope:** wachtwoorden, social login, Learn-sync.
- **Policies:** P, V, W, L.
- **Verificatie:** auth-integratie, e2e NL/EN met mailstub; keyboard, no-JS, replay/open-redirectcases.

### `FBK-008` — Loginmisbruik en mailbombing beperken

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, accessibility.
- **Scope:** loginrequest vóór mailverzending; **doel:** bots en kosten beperken.
- **Werk:**
  - Valideer gekozen challenge server-side; limiteer per adres, IP-sleutel en totaalbudget in gedeelde opslag.
  - Toon toegankelijke throttling/retry-info; minimiseer en expireer securitysleutels.
- **Klaar wanneer:** parallelle requests niet langs limieten komen; challengeverval/replay en provideruitval veilig worden afgehandeld; no-JS-pad dezelfde controles heeft.
- **Afhankelijkheden:** FBK-007; DEC-FBK-006/014/018.
- **Buiten scope:** blijvende IP-profielen, fingerprinting.
- **Policies:** P, V, L.
- **Verificatie:** concurrentie-/failuretests, e2e challenge stub, handmatige no-JS/accessibility en gedeeld-netwerkcase.

### `FBK-009` — Beheerrollen en objectautorisatie afdwingen

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, testing.
- **Scope:** staffroute en iedere private actie; **doel:** alleen bevoegde mensen beoordelen.
- **Werk:**
  - Geef rollen gecontroleerd uit; controleer sessie/rol server-side, ook bij directe POSTs en exports.
  - Voorkom caching van private HTML/data en trek stafftoegang aantoonbaar in.
- **Klaar wanneer:** anoniem/gewone gebruiker geen queue of andere melding leest/wijzigt; rolverlies direct doorwerkt; UI-verbergen is niet de beveiliging.
- **Afhankelijkheden:** FBK-007; DEC-FBK-005.
- **Buiten scope:** publieke redacteursprofielen, CMS voor wijncontent.
- **Policies:** P, K, V.
- **Verificatie:** unit/integratie autorisatiematrix, e2e directe URL/POST/IDOR/cachecases; keyboard/no-JS voor beheershell.

### `FBK-010` — Uitkomstmail betrouwbaar en begrensd versturen

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, testing.
- **Scope:** outbox en NL/EN-templates; **doel:** iedere uitkomst terugkoppelen zonder dubbele mail.
- **Werk:**
  - Schrijf beslissing, audit en unieke email_event atomisch; worker retries met limieten en deduplicatie.
  - Dek ontvangst, review, vraag, acceptatie, duplicate, directe correctie, afwijzing en later wijzigingssignaal; geen misbruikmail; verwerk geauthenticeerde bounces/suppression.
- **Klaar wanneer:** herhaalde events/providerfouten geen logische dubbele verzending veroorzaken; mail bevat menselijk label en veilige eigen-meldinglink, geen body/quote/tokenlog; bezorgprobleem is zichtbaar voor beheer.
- **Afhankelijkheden:** FBK-006/007; DEC-FBK-004/012/017.
- **Buiten scope:** nieuwsbrieven, trackingpixels, door gebruikers gekozen ontvangers.
- **Policies:** P, V, W, L.
- **Verificatie:** outbox-/retry-/webhooktests, template NL/EN en handmatige tekst/HTML-mailreview; link-e2e zonder JS.

### `FBK-011` — Sectie-, pagina- en footerinstap maken

- **Status:** open; **prioriteit:** middel; **categorieën:** product-ux, accessibility, engineering.
- **Scope:** contentrenderer en feedbackroute; **doel:** rustig melden vanuit de juiste context.
- **Werk:**
  - Voeg “Klopt dit niet?” / “Something wrong?” toe als gewone link; toon actie bij hover én focus, met bereikbare niet-hoverroute en zichtbaar blockfooter op mobiel.
  - Toon pagina/sectie en optioneel citaat read-only; resolveer stable target op server, bewaar locale/depth/terugkeercontext en geleverde contentversie.
- **Klaar wanneer:** alle blocktypen en owner-anchors kloppen; general/page zonder block werkt; manipulatie van hidden IDs/hashes/URLs geen willekeurig of drafttarget toelaat; verdwenen target geeft eerlijke state.
- **Afhankelijkheden:** FBK-001/003/007; DEC-FBK-011/012.
- **Buiten scope:** tekstselectie, modal als enige toegang, interne IDs in publieke copy.
- **Policies:** P, K, B, V, W, L.
- **Verificatie:** resolverunits, e2e NL/EN entity/narrative/embedded/page/general, keyboard, 320/390/768/1440 px, zoom en no-JS.

### `FBK-012` — Feitelijke fout met bron indienen

- **Status:** open; **prioriteit:** hoog; **categorieën:** product-ux, engineering, research.
- **Scope:** eerste meldsoort end-to-end in staging; **doel:** bruikbare brongebonden signalen ontvangen.
- **Werk:**
  - Maak tweestapsformulier met toelichting en verplichte bron-URL óf bibliografische referentie; voorgestelde formulering optioneel.
  - Valideer server-side Zod/plain text, doel en limieten; escape bij iedere presentatie; sla één report met immutable targetsnapshot op.
- **Klaar wanneer:** bronloze feitmelding gerichte NL/EN-fout krijgt en invoer behoudt; geldige referentie zonder URL werkt; broninput is niet als geverifieerde claim aangemerkt; geen serverfetch van ingevoerde URL.
- **Afhankelijkheden:** FBK-006/010/011; DEC-FBK-014.
- **Buiten scope:** bewijs automatisch beoordelen, bron scrapen, wijnkennis automatisch wijzigen.
- **Policies:** P, K, B, R, V, W, L.
- **Verificatie:** schema-/injection-/malformed-URLtests, DB-integratie, e2e NL/EN, keyboard/foutfocus/no-JS.

### `FBK-013` — Vier overige minimale meldformulieren leveren

- **Status:** open; **prioriteit:** middel; **categorieën:** product-ux, engineering, accessibility.
- **Scope:** uitleg, vertaling, defect, algemene suggestie; **doel:** passend vragen zonder onnodige bronplicht.
- **Werk:**
  - Hergebruik de tweestapsflow met per soort relevante uitleg en bron optioneel; vertaling bewaart gelezen locale, geen dubbele feitenlaag.
  - Voeg pagina/footerfeedback zonder fictief package/block toe; locale en veilige pagina-URL blijven bekend.
- **Klaar wanneer:** alle vier soorten hun minimale flow halen; feitmelding blijft bronplichtig; wisselen van soort en validatiefout verliest geen geldige invoer.
- **Afhankelijkheden:** FBK-012.
- **Buiten scope:** bijlagen/screenshots uploaden, publieke suggestielijst.
- **Policies:** P, K, V, W, L.
- **Verificatie:** per-kind schemaunits, representatieve e2e NL/EN en no-JS; mobile/keyboardreview.

### `FBK-014` — Inzendingen atomisch begrenzen en dedupliceren

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, testing.
- **Scope:** submit- en replygrens; **doel:** geen spam, races of dubbele open melding.
- **Werk:**
  - Controleer verified account/ban, CSRF/origin, user/IP-limieten, grootte en links vóór opslag; beveilig verborgen velden server-side.
  - Gebruik idempotency en DB-uniciteit voor één open melding per user/package/block, over beide locales en soorten; aparte page/generalquota.
- **Klaar wanneer:** gelijktijdige submits, dubbelklikken en retries één logisch report opleveren; andere gebruiker mag eigen melding sturen; reply heeft eigen limieten; overschrijding geeft geen 500 of bodylogs.
- **Afhankelijkheden:** FBK-008/012/013; DEC-FBK-008/012/014.
- **Buiten scope:** reputatie als eerste toegangseis, duplicate automatisch afwijzen.
- **Policies:** P, K, V, L.
- **Verificatie:** echte DB-race-/quotatests, CSRF/IDOR/oversized payload, e2e herindienen/no-JS en toegankelijke retrycopy.

### `FBK-015` — Ontvangst, eigen detail en één antwoordronde

- **Status:** open; **prioriteit:** hoog; **categorieën:** product-ux, engineering, accessibility.
- **Scope:** eigen reportdetail; **doel:** gesloten terugkoppellus vanaf fase 1.
- **Werk:**
  - Toon ontvangst, status, verwachting en menselijke reden achter auth; gebruiker ziet uitsluitend eigen melding.
  - Maak één aanvullend antwoord mogelijk na verzoek, met deadline/invoerlimieten en terugkeer naar behandeling.
- **Klaar wanneer:** tweede antwoord en antwoord buiten toegestane toestand server-side worden geweigerd; deadlineverloop vraagt beheerbesluit in plaats van automatische strike; maildetail werkt zonder JS.
- **Afhankelijkheden:** FBK-010/014; DEC-FBK-012/014.
- **Buiten scope:** “Mijn meldingen”-lijst, chat, onbeperkte correspondentie.
- **Policies:** P, V, W, L.
- **Verificatie:** state-/ownershiptests, e2e reply/replay/deadline NL/EN, keyboard en no-JS.

### `FBK-016` — Private moderatiewachtrij per target

- **Status:** open; **prioriteit:** middel; **categorieën:** product-ux, engineering, accessibility.
- **Scope:** queue, detail en groepering; **doel:** snel triage doen met juiste context.
- **Werk:**
  - Groepeer per package/block, behoud locale en afzonderlijke meldingen; page/general krijgen eigen groep.
  - Toon oorspronkelijke versie, huidige context, bronreferentie en eerlijke ontbrekende/gewijzigde targetstate; minimaliseer accountgegevens.
- **Klaar wanneer:** filters/paginering werken zonder JS; inhoud is escaped; groepeeractie lekt geen inzending van een ander naar een gebruiker; geen open bron-URL automatisch ophalen.
- **Afhankelijkheden:** FBK-009/014/015.
- **Buiten scope:** AI-triage, openbaar dashboard, automatisch duplicates beslissen.
- **Policies:** P, K, B, V, W, L.
- **Verificatie:** query/ownershiptests, queue-e2e met synthetische duplicates/stale targets, keyboard/mobile/no-JS.

### `FBK-017` — Behandelen en om aanvullende informatie vragen

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, product-ux, testing.
- **Scope:** ontvangen → behandeling → informatievraag → behandeling; **doel:** controleerbare workflow.
- **Werk:**
  - Implementeer besloten transitietabel met optimistic locking en atomaire decision/audit/mail-event.
  - Voeg beheerde vraagtemplate en één replyronde toe; redacteur bepaalt vervolgbesluit bij onvoldoende antwoord.
- **Klaar wanneer:** twee reviewers geen besluiten overschrijven; iedere toegestane transitie juiste template krijgt; ongeldige transitie niets schrijft/verstuurt; gebruiker ziet begrijpelijke actuele status.
- **Afhankelijkheden:** FBK-010/015/016; DEC-FBK-012/014.
- **Buiten scope:** automatische inhoudelijke besluitvorming, tweede replyronde.
- **Policies:** P, R, V, W, L.
- **Verificatie:** volledige transitietabel-/concurrentietests, DB-rollback, e2e beheer → mail → reply zonder JS.

### `FBK-018` — Accepteren of als duplicate koppelen

- **Status:** open; **prioriteit:** hoog; **categorieën:** product-ux, engineering, operations.
- **Scope:** geaccepteerde meldingen en werkreferenties; **doel:** geldige signalen uitvoerbaar maken.
- **Werk:**
  - Koppel bestaand of handmatig aangemaakt domeinticket met veilige probleemsamenvatting; controleer bestaan vóór acceptatie.
  - Koppel duplicates aan dezelfde werkreferentie/private groep; toon gebruikers alleen hun eigen uitkomst en veilig gepubliceerde werklink.
- **Klaar wanneer:** acceptatie zonder echte werkreferentie wordt geweigerd; duplicate geen andere reportbody/account/link onthult; retry één beslissing/mail oplevert; geen automatische Git-publicatie.
- **Afhankelijkheden:** FBK-017; DEC-FBK-009/012.
- **Buiten scope:** GitHub-issue automatisch aanmaken, alle feedback MNT noemen.
- **Policies:** P, K, R, W, L.
- **Verificatie:** referentie-/privacy-/concurrentietests, handmatige geredigeerde ticketreview en NL/EN-e2e/no-JS.

### `FBK-019` — Direct corrigeren of gemotiveerd afwijzen

- **Status:** open; **prioriteit:** hoog; **categorieën:** research, engineering, product-ux.
- **Scope:** eindbesluiten en redactioneel record; **doel:** feitelijk verantwoorde uitkomst.
- **Werk:**
  - Vereis bij directe correctie een geverifieerd commit/correctierecord met oud/nieuw begrip, bronnen, datum, reviewer en downstream NL/EN/rebuildcheck.
  - Gebruik beheerde afwijsredenen met optionele gecontroleerde toelichting; meldtekst/bron blijft onbewezen tot onderzoek.
- **Klaar wanneer:** “direct gecorrigeerd” niet op ongepubliceerd concept berust; afwijzing geen strike geeft; bronloze/onzekere claim niet automatisch canonical wordt; audit en uitkomstmail kloppen.
- **Afhankelijkheden:** FBK-017/018; DEC-FBK-012/015.
- **Buiten scope:** automatisch mergen, gebruiker als bron, publiek reportbody tonen.
- **Policies:** P, K, R, W, L; geography-policy bij geografische correctie.
- **Verificatie:** decision-/recordschemaunits, e2e correctie/afwijzing/mail/no-JS; handmatige feit-/bron-/publicatiereview.

### `FBK-020` — Bevestigd misbruik, waarschuwingen en bans

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, product-ux.
- **Scope:** private counters en misbruikbesluit; **doel:** herhaald misbruik proportioneel stoppen.
- **Werk:**
  - Registreer menselijke reden en strike; tel accepted/declined/abuse zonder openbare scores; expireer en corrigeer counters.
  - Toon waarschuwingen op twee drempels, ban op derde; trek submit/sessierechten in volgens beleid, houd beroep/rechten bereikbaar.
- **Klaar wanneer:** duplicateklik geen tweede strike geeft; afwijzingen nooit drempels verhogen; misbruikbesluit geen mail-event maakt; verlopen/herroepen strikes correct doorwerken.
- **Afhankelijkheden:** FBK-009/017/019; DEC-FBK-007/012.
- **Buiten scope:** AI-bans, reputatiegamification, e-mail naar abuse-uitkomst.
- **Policies:** P, V, W, L.
- **Verificatie:** grenswaarde-/venster-/replay-/ban-authorisatietests, e2e zichtbare waarschuwingen NL/EN/no-JS.

### `FBK-021` — Beroep en herstel bereikbaar maken

- **Status:** open; **prioriteit:** hoog; **categorieën:** product-ux, accessibility, operations.
- **Scope:** beveiligd beroep op strike/ban; **doel:** menselijke fouten herstellen.
- **Werk:**
  - Geef geblokkeerde gebruiker een minimale geverifieerde, begrensde beroeproute buiten normale submitblokkade.
  - Laat mens uitspraak/herroeping vastleggen, counters herstellen en toegestane terugkoppeling geven zonder reportchat te openen.
- **Klaar wanneer:** banned account beroep/export/deletion kan bereiken; beroep niet als nieuwe sectiemelding telt; één herstelbesluit traceerbaar is; abuse-report blijft mailvrij.
- **Afhankelijkheden:** FBK-020; DEC-FBK-007/014.
- **Buiten scope:** publiek beroep, onbeperkte antwoorden.
- **Policies:** P, V, W, L.
- **Verificatie:** ownership/rate/state-tests, handmatige eerlijke-beroepreview; e2e banned → beroep → herstel met keyboard/no-JS.

### `FBK-022` — Retentie en herstel na backup uitvoeren

- **Status:** open; **prioriteit:** hoog; **categorieën:** operations, engineering, testing.
- **Scope:** geautomatiseerde purging en operationele verwijderketen; **doel:** termijnen daadwerkelijk naleven.
- **Werk:**
  - Wis/anonimiseer verlopen body/quote/bron/reply, mail- en securitymetadata volgens datamodel; bewaak stale open reports.
  - Oefen backupverloop en restore met heruitgevoerde deletions; minimaliseer audit zonder oorspronkelijke tekst in cleanup-log.
- **Klaar wanneer:** tijdsprongfixtures iedere dataklasse opruimen; herstel geen verwijderd profiel heractiveert; exceptions hebben begrensd doel/eigenaar/vervaldatum.
- **Afhankelijkheden:** FBK-006/010/020/021; DEC-FBK-006/016/017.
- **Buiten scope:** persoonsgegevens eindeloos bewaren wegens “audit”.
- **Policies:** P, K.
- **Verificatie:** scheduler-/retentie-integratie, synthetische backup/restore/deleteproef en handmatige providerlogreview; geen nieuwe publieke UI.

### `FBK-023` — Private gegevensexport leveren

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, product-ux, operations.
- **Scope:** verzoek, identitycheck en download; **doel:** eigen gegevens controleerbaar verstrekken.
- **Werk:**
  - Exporteer account, eigen meldingen/replies, besluiten en toepasselijke metadata in leesbare versieerbare vorm.
  - Beveilig aanvraag/download, korte geldigheid, geen gedeelde caching of gegevens van anderen; beschrijf eventuele gemotiveerde beperkingen.
- **Klaar wanneer:** synthetische export volledig binnen de besloten scope is; banned account toegang houdt; andere gebruiker/reviewerprivédata niet uitlekt; uitvoeringsrunbook een verantwoordelijke heeft.
- **Afhankelijkheden:** FBK-009/021/022; DEC-FBK-006/016/017.
- **Buiten scope:** publieke datasets, exportbestand in Git.
- **Policies:** P, K, V, W, L.
- **Verificatie:** volledigheid/IDOR/expirytests, e2e export NL/EN/no-JS en handmatige leesbaarheid.

### `FBK-024` — Account en gekoppelde persoonsgegevens verwijderen

- **Status:** open; **prioriteit:** hoog; **categorieën:** engineering, operations, product-ux.
- **Scope:** geverifieerd verwijderverzoek en cascade; **doel:** gecontroleerd beëindigen.
- **Werk:**
  - Verwijder/minimaliseer auth, reports, decisions, strikes, mail, audit en later credit/Learn volgens beleid; trek sessies en exports in.
  - Stop pending mails/jobs en documenteer provider-/backuplevenscyclus; behoud uitsluitend daadwerkelijk anonieme redactionele feiten.
- **Klaar wanneer:** herhaalde deletion idempotent is; gekoppelde data niet via duplicates/audit achterblijft; jobs data niet terugplaatsen; uitzonderingen menselijk gemotiveerd en begrensd zijn.
- **Afhankelijkheden:** FBK-022/023; DEC-FBK-006/010/016/017.
- **Buiten scope:** eigen aanname dat alle erasureverzoeken absoluut of automatisch afgewezen zijn.
- **Policies:** P, K, V, W, L.
- **Verificatie:** cascade-/retry-/worker-racetests, providerstub/restoreproef, e2e met banned account en no-JS.

### `FBK-025` — Fase 1 gecontroleerd vrijgeven

- **Status:** open; **prioriteit:** hoog; **categorieën:** testing, accessibility, operations, research.
- **Scope:** geïntegreerde staging- en deploymentreview; **doel:** veilig echte meldingen ontvangen.
- **Werk:**
  - Doorloop vijf soorten, alle uitkomsten, één reply, misbruik/beroep en rechten met synthetische accounts; publiceer gereviewd NL/EN-beleid.
  - Toets reactietijdcapaciteit, submitduur, keyboard/mobile/no-JS, provideruitval, databasepools en kill switch; leg go/no-go vast in gedateerde QCR.
- **Klaar wanneer:** FBK-001–024/MNT-050 klaar zijn, launchgates gesloten, lokale checks en relevante e2e slagen; MNT-056 verifieert echte hosting/secrets/jobs; beheerder/privacycontact aantoonbaar beschikbaar.
- **Afhankelijkheden:** FBK-001–024, MNT-050, MNT-056; DEC-FBK-001–009/011–018.
- **Buiten scope:** creditbesluit forceren vóór fase 2, publieke uitrol op alleen lokale tests.
- **Policies:** P, K, B, V, R, W, L.
- **Verificatie:** npm run format/check, geïntegreerde e2e NL/EN, keyboard/screenreader/zoom/no-JS, privacy-/abuse-/mail/restoreproeven en staging/live handmatige controle.

### Fase 2 — beter terugvinden en zichtbaar verbeteren

### `FBK-026` — Selectie als optioneel citaat meenemen

- **Status:** open; **prioriteit:** middel; **categorieën:** product-ux, accessibility, engineering.
- **Scope:** progressive enhancement op blockinstap; **doel:** preciezer melden zonder extra typewerk.
- **Werk:**
  - Neem uitsluitend zichtbare selectie uit één block mee als begrensde plain text; laat gebruiker citaat controleren/verwijderen.
  - Houd gewone link/formulierroute werkend; cross-block/selectie buiten content vraagt expliciete sectiekeuze.
- **Klaar wanneer:** geen verborgen/andere paginadata wordt verstuurd; keyboard/touchselectie werkt; zonder JS hetzelfde report zonder selectie kan worden ingediend.
- **Afhankelijkheden:** FBK-025; DEC-FBK-014.
- **Buiten scope:** DOM/HTML upload, automatisch klembord lezen.
- **Policies:** P, K, B, V, W, L.
- **Verificatie:** selectie/escapeunits, e2e multi-block/mobiel/keyboard/no-JS-fallback.

### `FBK-027` — Mijn meldingen als privéoverzicht

- **Status:** open; **prioriteit:** middel; **categorieën:** product-ux, accessibility, engineering.
- **Scope:** gepagineerde eigen lijst met status; **doel:** eerdere bijdragen terugvinden.
- **Werk:**
  - Toon menselijk onderwerp, status, datum en eigen detaillink; behoud locale en eerlijke lege/verwijderde states.
  - Beveilig filters/paginering en toon waarschuwing/beroep waar relevant zonder publieke reputatiescore.
- **Klaar wanneer:** gebruiker alleen eigen reports ziet, ook via gemanipuleerde URL; no-JS-list en bestaande fase-1-detail werken; uitgelogde responses niet gecachet privé zijn.
- **Afhankelijkheden:** FBK-025.
- **Buiten scope:** openbaar profiel, leaderboards.
- **Policies:** P, V, W, L.
- **Verificatie:** ownership/querytests, e2e NL/EN leeg/meerdere/verlopen states, mobile/keyboard/no-JS.

### `FBK-028` — Contentwijziging herkennen en eenmalig melden

- **Status:** open; **prioriteit:** middel; **categorieën:** engineering, knowledge-data, operations.
- **Scope:** reconciliatie na contentpublicatie; **doel:** verouderde targetcontext zichtbaar maken.
- **Werk:**
  - Vergelijk build-ID/hashversie/localehash met actuele bundle; onderscheid gewijzigd, verwijderd en onbekende hashversie.
  - Voeg onafhankelijk wijzigingssignaal toe en dedupliceer mail per report/nieuwe hash; check definitieve misbruik-/deletionstate vóór verzending.
- **Klaar wanneer:** andere block/locale geen vals signaal geeft; ongewijzigde rebuild geen mail maakt; gewijzigde of verdwenen sectie de behandeluitkomst niet overschrijft; reviewer moet correctie nog bevestigen.
- **Afhankelijkheden:** FBK-003/010/024/025; DEC-FBK-011/012/017.
- **Buiten scope:** iedere wijziging “opgelost” noemen, mails naar abuse/deleted accounts.
- **Policies:** P, K, B, R, V, W, L.
- **Verificatie:** hash-/schema-/reconciliationfixtures, job-/email-retries, e2e stale open/accepted/declined/deleted NL/EN/no-JS.

### `FBK-029` — Gereviewd correctielog per pagina tonen

- **Status:** open; **prioriteit:** middel; **categorieën:** research, product-ux, engineering.
- **Scope:** publieke projectie van correctierecords; **doel:** gecontroleerde inhoudelijke verbetering zichtbaar maken.
- **Werk:**
  - Toon redactioneel goedgekeurde wijziging, datum en relevante broncontext per ownerpagina in NL/EN.
  - Houd private reportkoppelingen, oorspronkelijke tekst en persoonsgegevens buiten publicatie; lege staat blijft eerlijk.
- **Klaar wanneer:** alleen gepubliceerde correcties verschijnen; directe wijziging heeft controleerbare commit/record; accountverwijdering laat geen private resten in log/cache achter; kennis blijft canonical file-backed.
- **Afhankelijkheden:** FBK-019/024/025; DEC-FBK-015.
- **Buiten scope:** publieke reportgeschiedenis, parallelle wijnkennis, accountdata in Git.
- **Policies:** P, K, R, V, W, L.
- **Verificatie:** projectie/leak/cachetests, e2e leeg/gevuld NL/EN/no-JS; handmatige redactionele review.

### `FBK-030` — Afzonderlijke opt-in voor contributor credit

- **Status:** open; **prioriteit:** laag; **categorieën:** product-ux, engineering, operations.
- **Scope:** credit op goedgekeurde correctie; **doel:** vrijwillige erkenning met intrekbare toestemming.
- **Werk:**
  - Vraag expliciete opt-in en eventueel alias; toon vooraf exact de publieke tekst; valideer/redigeer alias als plain text.
  - Bewaar credit/consent uitsluitend private DB; verwijderen/intrekken verwijdert publieke projectie en caches.
- **Klaar wanneer:** default uit staat, e-mail nooit publiek wordt, credit niet uit acceptatie wordt afgeleid en intrekken/deletion aantoonbaar doorwerkt.
- **Afhankelijkheden:** FBK-024/029; DEC-FBK-010/016.
- **Buiten scope:** gebruikersprofielen, badges, verplichte naam, credit opslaan in authored Gitdata.
- **Policies:** P, R, V, W, L.
- **Verificatie:** consent/projectie/deletiontests, NL/EN-e2e keyboard/no-JS en handmatige privacy-/aliasreview.

### `FBK-031` — Geredigeerde GitHub-issueaanmaak aansluiten

- **Status:** open; **prioriteit:** middel; **categorieën:** engineering, operations, product-ux.
- **Scope:** expliciete beheeractie op geaccepteerd werk; **doel:** tickets efficiënt uitvoeren.
- **Werk:**
  - Laat reviewer titel/body previewen en redigeren; publiceer uitsluitend goedgekeurde probleemsamenvatting zonder private report-/accountdata.
  - Gebruik minimale GitHub-rechten, idempotency, retry en ticketmapping; koppel duplicategroep aan bestaand issue in plaats van nieuw issue.
- **Klaar wanneer:** dubbelklikken/timeouts geen dubbele issues maken; storing acceptatie niet vervalst; preview en uiteindelijke payload gelijk zijn; issue nooit inzending/body/quote/PII kopieert.
- **Afhankelijkheden:** FBK-018/024/025, MNT-056; DEC-FBK-009/017.
- **Buiten scope:** code automatisch mergen, GitHub als gebruikersdatabase, retroactief alle reports uploaden.
- **Policies:** P, K, R, V, W, L.
- **Verificatie:** API-stubs/retry/redaction/leaktests, e2e beheer-preview zonder JS; echte issue alleen na expliciete publicatieautorisatie.

Fase-2-gate: relevante slices apart reviewen; volledige fase 2 pas klaar als
FBK-026–031 voldoen. Individuele credit blijft uit zolang DEC-FBK-010 open is.

### Fase 3 — gecontroleerde bijdragen en gedeelde accounts voor Learn

### `FBK-032` — Vertrouwde bijdragers gecontroleerd voorstellen laten doen

- **Status:** open; **prioriteit:** laag; **categorieën:** product-ux, research, engineering.
- **Scope:** handmatig toegekende contributorrol en wordingvoorstel; **doel:** beter voorbereide suggesties ontvangen.
- **Werk:**
  - Hergebruik report/target/review met versiegebonden tekstvoorstel en bronplicht waar feitelijk; rol blijft intrekbaar.
  - Toon bestaande en voorgestelde tekst aan reviewer; laat dezelfde menselijke bron-/NL/EN-publicatiecheck gelden.
- **Klaar wanneer:** contributor geen canonical write/merge kan uitvoeren; stale voorstel expliciet zichtbaar is; rol/limieten/retentie werken en publieke tekst pas na normale review verschijnt.
- **Afhankelijkheden:** FBK-025/027/028/029; DEC-FBK-013/015.
- **Buiten scope:** nieuwe kennislaag, zelfpublicatie, rol automatisch uit reputatiescore.
- **Policies:** P, K, B, R, V, W, L.
- **Verificatie:** rol/ownership/stale-schemaunits, e2e voorstel → menselijke review, no-JS/keyboard en handmatige researchreview.

### `FBK-033` — Accountgebonden Learn-progressadapter bouwen

- **Status:** open; **prioriteit:** middel; **categorieën:** engineering, product-ux, testing.
- **Scope:** tweede backendconsumer met bestaande interface; **doel:** voortgang via hetzelfde account bewaren.
- **Werk:**
  - Voeg minimale user/path/version/completed-step/updated-at-opslag toe met autorisatie en dezelfde load/save/clear/subscribe-acties.
  - Werk export/deletion/retentie uit, valideer bekende path-/step-ID's en voorkom verlies van anonieme browservoortgang.
- **Klaar wanneer:** adaptercontracttests dezelfde gebruikersacties ondersteunen; user A geen progress van B leest; reset/save geversioneerd zijn; content lezen en anonieme Learn blijven beschikbaar.
- **Afhankelijkheden:** FBK-024/025, LRN-012, MNT-050; DEC-FBK-019 sluit in FBK-034 vóór publieke activatie.
- **Buiten scope:** learning paths in DB, cijfers, dashboards, gedwongen login om te leren.
- **Policies:** P, K, V, L; learning-paths.md en bestaande progresscontracten.
- **Verificatie:** adaptercontract/DB/ownershiptests, e2e twee accounts en reset, no-JS/keyboard-regressie van Learn.

### `FBK-034` — Learn-merge, offlinegedrag en uitrol besluiten/toetsen

- **Status:** open; **prioriteit:** middel; **categorieën:** engineering, product-ux, operations, testing.
- **Scope:** browser → account en cross-device conflicten; **doel:** synchronisatie zonder stil verlies.
- **Werk:**
  - Leg vóór implementatie een versie-/conflictbesluit vast voor loginmerge, offline writes, reset/reopen en logout; vraag expliciete keuze vóór lokale data uploaden.
  - Bouw één gekozen mergepad, oefen retries/parallelle apparaten en accountverwijdering; breid scope met nieuw ticket uit als het niet in enkele dagen past.
- **Klaar wanneer:** consent/cancel, offline herstel en reset versus oudere writes aantoonbaar geen stil dataverlies geven; export/deletion syncdata omvat; LRN-012-uitkomst en publiekscopy overeenkomen.
- **Afhankelijkheden:** FBK-033, LRN-012; DEC-FBK-006/016/017; DEC-FBK-019 wordt in deze slice gesloten vóór syncimplementatie/activatie.
- **Buiten scope:** accountloze backgroundupload, Learn-curriculum uitbreiden, chat/communityfeed.
- **Policies:** P, K, V, W, L; learning-paths.md en bestaande progresscontracten.
- **Verificatie:** conflict/property/adaptertests, e2e twee apparaten/offline/logout/deletion, handmatige NL/EN/privacy/no-JS-releasecheck.

## Voorgesteld datamodel

Dit is een logisch ontwerp, geen bestaande migration of gekozen ORM. `uuid`,
`timestamptz`, `text`, `jsonb` en constrained enums zijn voorgestelde Postgresvormen.
Zod valideert invoer; DB-constraints en transacties bewaken races. PII =
persoonsgegeven of herleidbare koppeling, ook als het geen direct profielveld is.
Alle gebruikersrecords en providerexports blijven buiten Git, fixtures en bundle.

Retentiecodes volgen DEC-FBK-006: **A** account tot geverifieerde verwijdering,
met jaarlijkse inactiviteitstoets; **R** body/context tot 180 dagen na sluiting,
open na 180 dagen herbeoordelen; **D** minimale besluiten/security/audit maximaal
12 maanden, eerder wissen/minimaliseren bij geldige deletion; **E** mailmetadata
30 dagen; **S** securitylimietsleutels maximaal 24 uur; **C** anonieme redactionele
feiten zolang inhoud relevant blijft, persoonlijke credit apart intrekbaar.
Definitieve termijnen/rechtsgrond staan niet vast totdat DEC-FBK-006/016 sluiten.

| Entiteit | Velden en typen | PII | Retentie |
| --- | --- | --- | --- |
| `user` | `id uuid PK`, `auth_subject text unique`, `email text unique`, `email_verified_at timestamptz?`, `role enum(reader,reviewer,admin,contributor)`, `state enum(active,banned,deleting)`, `created_at/last_active_at timestamptz`, `accepted_count/declined_count/abuse_count int >=0` afgeleid/herstelbaar | Ja: e-mail en alle accountkoppelingen; rol/counters niet publiek | A; ban/strikeonderbouwing D, niet automatisch eeuwig bewaren |
| `report` | `id uuid PK`, `user_id uuid FK?` null na deletion, `kind enum` vijf soorten, `status enum` acht menselijke uitkomsten hieronder, `open_target_key text?` afgeleid voor uniciteit, `body text`, `source_reference text?`, `suggested_wording text?`, `reply_text text?`, `reply_count smallint 0..1`, `reply_due_at/replied_at timestamptz?`, `duplicate_of uuid FK?`, `work_kind/work_ref text?`, `row_version int`, `idempotency_key uuid`, `created_at/closed_at timestamptz?` | Ja: tekst/URLs/koppelingen kunnen personen identificeren; work_ref is alleen veilig geredigeerd werk | Body/source/suggestion/reply R; geminimaliseerde besluitkoppeling D; deletion cascade/minimalisatie |
| `report_target` | `report_id uuid PK/FK`, `scope enum(block,page,general)`, `package_id text?`, `block_id text?`, `locale enum(nl,en)`, `quote text?`, `page_url text` same-origin zonder gevoelige query, `bundle_build_id text?`, `hash_version int?`, `block_hash text?`, `observed_hash text?`, `change_state enum(unchanged,changed,removed,unknown)` | Quote/URL mogelijk PII; koppeling maakt ook niet-persoonlijke IDs herleidbaar | Quote/URL R, geminimaliseerde target D; blockhash alleen voor blockscope; general geen verzonnen IDs |
| `decision` | `id uuid PK`, `report_id uuid FK`, `reviewer_id uuid FK?`, `from_status/to_status enum`, `reason_code text?`, `note text?`, `work_ref text?`, `correction_id uuid FK?`, `created_at timestamptz`, `report_version int`, `supersedes uuid?` | Ja: reviewer-/reportkoppeling en note; publicatieprojectie is apart | D; notes eerder R; herroeping append-event, privacywissing blijft mogelijk |
| `strike` | `id uuid PK`, `user_id/report_id/decision_id uuid FK`, `reason_code text`, `created_at/expires_at timestamptz`, `revoked_at timestamptz?`, `appeal_text text?`, `appeal_status enum?`, `appeal_reviewer_id uuid?` | Ja, ook veiligheidsbesluit/beroep | Actieve telling 180 dagen als voorstel; onderbouwing D, appealbody R; geen forever-bantombstone zonder besluit |
| `email_event` | `id uuid PK`, `decision_id uuid?`, `report_id/user_id uuid FK?`, `event_key text unique`, `template/locale text`, `status enum(pending,sending,sent,failed,suppressed)`, `attempts int`, `next_attempt_at/sent_at timestamptz?`, `provider_message_id text?`, `last_error_code text?` | Ja: ontvanger afleiden via user, provider-ID/koppeling herleidbaar; geen mailbody/token opslaan | E; pending events bij deletion stoppen; inhoud in providerretentie meenemen |
| `audit_entry` | `id uuid PK`, `actor_id uuid?` system toegestaan, `subject_type/subject_id text`, `action text`, `before_status/after_status text?`, `reason_code text?`, `event_key text unique`, `created_at timestamptz` | Ja: actor/subjectkoppeling; geen reportbody, token, raw IP of e-mail in payload | D, privacy-gestuurde minimalisatie/purge; “audit” betekent geen onbeperkte bewaarplicht |
| `correction_record` | Noodzakelijke bridge, geen tweede wijnbron: `id uuid`, `package_id/block_id text?`, `old_understanding/new_understanding text`, `source_refs jsonb`, `reviewer_id uuid?`, `reviewed_at/published_at timestamptz?`, `commit_ref text`, `downstream_checks jsonb`, `public_nl/public_en text?`, `credit_user_id uuid?`, `credit_alias text?`, `credit_consent_at/revoked_at timestamptz?` | Private links/credit/reviewer ja; apart gereviewde redactionele projectie kan anoniem zijn | C voor anonieme feiten; private koppelingen D; credit tot intrekking/deletion, nooit Git |
| Authsessies/verificatietokens | Providerafhankelijk: opaque subject/session-ID, gehashte verification token, expiry, revocation; precieze velden na DEC-FBK-002 | Ja; secrets nooit loggen of exporteren als credentials | Korte besloten sessie-/tokenlevensduur, direct intrekken/wissen bij deletion |
| Tijdelijke limietsleutel | Gedeelde private opslag: `scope text`, `key_hmac text`, `count int`, `expires_at timestamptz`; geen ruwe IP-opslag in app | Ja/pseudoniem; provider-/infralogs afzonderlijk beoordelen | S, bij voorkeur korter per venster; geheim roteren |

Fase-3-Learn-progress krijgt pas een migration in FBK-033: `user_id`, `path_id`,
`schema_version`, `completed_step_ids`, `updated_at` plus expliciet besloten
conflictversie. Retentie/export/deletion sluiten dan op hetzelfde account aan.
Dit ontwerp maakt geen extra geografie-, entity- of reportkennisstelsel.

### Target- en versieconstraints

- `block`: bestaande publieke entity/narrative + block + locale; build-ID,
  hashversie en hash verplicht. `page`: package-ID waar van toepassing, geen
  block/hash; bundle-ID indien contentpagina. `general`: package/block/hash
  nullable, locale en veilige pagina-URL verplicht.
- `package_id`/`block_id` verwijzen logisch naar canonical IDs, nooit naar
  bestandspaden. Geen FK naar een hypothetische contentdatabasetabel.
- Hashvoorstel v1: canonieke serialisatie met gesorteerde objectkeys en
  semantische arrayvolgorde van blocktype, parent, depth, variant, nodes,
  source_refs plus gebruikte bronrecords en figuremetadata/checksum. Geen
  kloktijd, private metadata of eigen hash opnemen. Leg precieze dependencies
  en hashversiemigratie vast in FBK-003; source-/mediabytes buiten scope worden
  niet bij elke serverrequest gelezen.
- Build-ID is SHA-256 over deterministische bundle inclusief blockhashes,
  exclusief eigen versionerings-ID. Een deployment-ID kan aanvullend bestaan,
  maar vervangt dit niet. Een oude browser mag een oudere valide snapshot
  melden: bewaar geclaimde versie als snapshot, vergelijk met actueel en geef
  eerlijk stale-contextsignaal. Vertrouw nooit clienthash als feitelijk bewijs.
- Logisch één open blockmelding op `(user_id, package_id, block_id)` ongeacht
  locale en kind. Omdat die velden over report/target verdeeld zijn, krijgt
  `report` een uitsluitend server-/DB-beheerde `open_target_key` uit de stable
  blockidentiteit. Een partial unique index op `(user_id, open_target_key)`
  voor de besloten open statuses bewaakt races; transactionele constraint/trigger
  bewaakt overeenstemming met `report_target`. Geen cross-table index aannemen.
  Page/general hebben null, geen nepanker om deze index te hergebruiken.

### Uitkomst- en notificatiecontract

| Intern | Publieke NL / EN | Effect en mail |
| --- | --- | --- |
| `received` | Ontvangen / Received | Open; één ontvangstmail |
| `in_review` | In behandeling / Under review | Open; mail bij echte transitie, niet bij opnieuw openen van beheerpagina |
| `needs_info` | Meer informatie nodig / More information needed | Open; één replyronde en deadline; mail met eigen beveiligde detailroute |
| `accepted` | Geaccepteerd / Accepted | Gekoppeld aan daadwerkelijk werk; geen claim dat correctie al live is; mail |
| `duplicate` | Al in behandeling / Already being handled | Bestaand werk/private groep; nooit andere inzending onthullen; mail |
| `fixed_directly` | Gecorrigeerd / Corrected | Gereviewde publicatie/commit + correctierecord vereist; mail |
| `declined` | Niet overgenomen / Not taken forward | Menselijke reden, optionele toelichting; mail, geen strike |
| `abuse` | Melding in strijd met de regels / Report breaches the rules | Menselijke misbruikbeslissing + strike; geen uitkomstmail; accountwaarschuwing/beroep bereikbaar |
| Afzonderlijk `change_state` | Sectie gewijzigd sinds je melding / Section updated since your report | Automatisch versieverschil, geen resolutie; dedupliceerde mail behalve bij abuse/deleted; removed/unknown eerlijk benoemen |

FBK-017 legt toegestane overgangen expliciet vast, inclusief menselijke
herroeping en accepted → fixed_directly bij latere daadwerkelijk gepubliceerde
correctie. Status, besluit, audit en outboxevent worden in één transactie
geschreven. Iedere send doet een laatste suppression/deletioncheck; een extern
mailverzoek dat al verzonden is kan niet achteraf ongedaan worden gemaakt.

## Misbruik- en dreigingschecklist

| Stap / dreiging | Maatregel | Eigenaar |
| --- | --- | --- |
| Login: bots, accountenumeratie, mailbox bombarderen | Serverchallenge/no-JS-pariteit, generieke ontvangstcopy, gedeelde adres/IP/totaallimieten | FBK-007/008; DEC-FBK-018 |
| Login: tokenreplay, session theft, open redirect | Eenmalig vervallend token, veilige cookies, sessie-intrekking, same-origin returnpad | FBK-007/009 |
| Instap: vervalst target/hash, oude pagina, verborgen draft | Serverresolver, publieke owner/blockcontrole, localeversie bewaren, expliciete stale/removed state | FBK-003/011/028 |
| Selectie: hidden DOM/andere sectie meegestuurd | Eén zichtbaar block, plain text, cap en gebruikercontrole | FBK-026 |
| Submit: CSRF, oversized payload, linkspam, XSS | Origin/CSRF-check, Zod, serverlimieten, plain text en outputescaping; geen bijlagen | FBK-012–014 |
| Bronlink: SSRF of schadelijke link | Nooit automatisch fetch; alleen veilige schemes voor aanklikken, beheerder ziet bestemming; URL is geen bronverificatie | FBK-012/016/019 |
| Submit: race, dubbelklik, cross-locale duplicatie | Idempotency, DB-partial-unique index, user/IP-quota, banned/verified check per write | FBK-014 |
| Detail/reply: IDOR, eindeloze thread, deadlinebypass | Eigenaarcontrole, private caching, één server-enforced reply, rate cap | FBK-009/015/017 |
| Beheer: privilege escalation, gelijktijdige besluiten | Rolecheck per actie, beperkte roluitgifte, row_version/transaction, audit | FBK-009/017–019 |
| Duplicate: melding van een ander blootleggen | Groep alleen intern, publieke werklink geredigeerd, geen andere report-ID/body | FBK-016/018 |
| Mail: dubbele/ongewenste berichten, bounces, kosten | Atomische outbox, eventkeys, retries/quotas/suppression, geauthenticeerde webhooks, geen tracking | FBK-010/020/024/028 |
| Reputatie: onterechte automatische ban | Alleen bevestigde abuse telt, twee waarschuwingen, expiring/revocable strikes, menselijk beroep | FBK-020/021 |
| GitHub: PII-copy, privilege-/kostenmisbruik | Menselijke redactie/preview, allowlisted bestemming, minimale rechten, idempotency | FBK-018/031 |
| Opslag/logs/backups: datalek, oneindige bewaring | Secrets/accessgrenzen, geen body/tokenlogs, retentie/purge, geteste restore en deletionketen | FBK-005/006/022–024 |
| Rechten: export van ander, rehydration na deletion | Verificatie/ownership, korte exportgeldigheid, jobs stoppen, restore opnieuw filteren | FBK-023/024 |
| Credit: e-mail/naam ongevraagd publiek | Default uit, aparte opt-in, gecontroleerde alias, intrekken/cachewissen | FBK-030 |
| AI: verzonnen bewijs of ongeoorloofde doorgifte | Default uit; mens onderzoekt bron en beslist; aparte provider/privacygate | FBK-005/019/032; DEC-FBK-013 |
| Learn: accountmix, offline reset overschreven | Bestaande adaptergrens, autorisatie, expliciet merge/conflictbesluit, export/deletion | FBK-033/034 |
| Uitrol: serverless jobs verloren, DB/mailuitval | Besloten worker, retries, monitoring zonder bodies, featurepauze en echte deploymentcheck | FBK-010/025; MNT-056 |

## Open vragen voor de beheerder

Geen antwoord is geen toestemming. Onderstaande defaults zijn voorstellen;
provider-, privacy- en launchgates blijven open totdat het besluit is vastgelegd.

1. **Wanneer wil je feedback live, ten opzichte van de wijnbatch/regiopilots?**
   Bepaalt capaciteit en volgorde. Default: fase 0 vóór nieuwe backendbouw,
   daarna EXP-032/026 door; fase 1 afzonderlijk inplannen, niet stilzwijgend nu bouwen.
2. **Wie beoordeelt en wie vervangt diegene bij afwezigheid?** Nodig voor
   responsverwachting en beroep. Default: geen publieke SLA of lancering zonder
   benoemde beheerder; 5 werkdagen slechts als streefwaarde na capaciteitstoets.
3. **Wat zijn budget en operationele voorkeur voor auth/Postgres/mail?**
   Bepaalt providerkeuze. Default: kleine providerproef; geen abonnement/contract
   afsluiten en geen provider als gekozen administreren.
4. **Welke botchallenge kan ook toegankelijk zonder JS?** Blokkeert de complete
   loginflow. Default: afwijzen als de proef dat niet bewijst; geen beveiliging
   uitschakelen of no-JS-eis stil schrappen.
5. **Wie is verwerkingsverantwoordelijke, wat is de doelgroep en het
   leeftijdsbeleid?** Nodig voor informatie/grondslag. Default: juridische
   teksten blijven draft en publieke accountinname blijft uit.
6. **Zijn de voorgestelde bewaartermijnen acceptabel en uitvoerbaar bij iedere
   leverancier?** Bepaalt storage en deletion. Default: DEC-FBK-006 open houden;
   geen echte data verzamelen op onbevestigde termijnen.
7. **Akkoord met strikes uitsluitend voor bevestigd misbruik, bij 2/4/6 in
   180 dagen?** Voorkomt afstraffen van goedbedoelde fouten. Default:
   afwijzingen tellen nooit mee; banmechanisme niet activeren vóór besluit.
8. **Mogen waarschuwingen bij abuse alleen in het account staan, met apart
   beroep?** Lost “geen abusemail” versus “automatisch waarschuwen” op.
   Default: geen abuse-uitkomstmail; waarschuwing/beroep wel toegankelijk.
9. **Wat geldt precies als gesloten en wanneer is een tweede melding op
   hetzelfde block toegestaan?** Bepaalt de unieke index. Default: alleen de
   eerste drie behandelstatuses zijn open; acceptatie is nog geen oplossing.
10. **Akkoord met domeinticket als werkwaarheid en GitHub als gekoppelde
    uitvoering?** Voorkomt dubbele backlogs en ongeoorloofde publicatie.
    Default: handmatig geredigeerde MNT/EXP/LRN/REG-referentie, automatisering later.
11. **Wil je individuele credit, en daarvoor een optionele alias toestaan?**
    Dit voegt een profielgegeven toe aan “alleen e-mail”. Default: credit uit,
    geen namen of e-mailadressen publiceren.
12. **Geldt één aanvullende reply ook voor beroep, en wie beslist daarover?**
    Nodig om een ban niet tot doodlopende route te maken. Default: aparte,
    begrensde beroeproute met menselijk besluit; geen onbeperkte dialoog.
13. **Wat gebeurt na de replydeadline en met maandenlang open werk?**
    Nodig voor eerlijke status en retentie. Default: beheerreview, geen
    automatische inhoudelijke afwijzing of strike.
14. **Welke Learn-mergeverwachting heb je: combineren, kiezen of resetten?**
    Bepaalt conflict- en offlinegedrag. Default: huidige lokale voortgang behouden,
    niet uploaden vóór expliciete keuze; besluiten in FBK-034/LRN-012.

## Definition of done

- De fase-0-besluiten zijn gedateerd en onderbouwd; providers/regio's,
  privacyverantwoordelijkheid, termijnen, limieten en beheerder zijn gekozen.
- Alle vijf meldsoorten werken in NL/EN, met betekenisvolle context, verplichte
  feitbron, veilige versie-identiteit en servervalidatie. De onder-30-secondendoelstelling
  is in taakproeven gemeten en beperkingen zijn eerlijk beschreven.
- Inzenden, login, eigen detail/reply, rechten en essentiële beheeracties werken
  zonder JavaScript en met toetsenbord; mobile, zoom, focus en screenreader zijn
  gecontroleerd. Tekstselectie blijft een optionele verbetering.
- Iedere uitkomst volgt de besloten transities, is auditbaar en krijgt de
  juiste begrensde mail; abuse blijft mailvrij. Duplicate/hashwijziging geeft geen
  valse oplossingsclaim en onthult geen andere gebruiker.
- Feitelijke correcties doorlopen menselijk brononderzoek en canonical
  NL/EN-review, met oud/nieuw begrip, bronnen, reviewer/datum en rebuildchecks.
  AI is geen bron of beslisser; usertext wordt nooit automatisch gepubliceerd.
- Bot-/rate-/size-/link-/CSRF-/auth-/racecontroles, strikes, waarschuwingen,
  bans en bereikbaar beroep zijn getest. Geen openbare comments, ratings of
  reputatiescores zijn ontstaan.
- Privacyteksten zijn gereviewd/gepubliceerd; retentie, export, deletion,
  verwerkers en restore zijn daadwerkelijk getest. Persoonsgegevens staan
  buiten Git, canonical content, benchmarks en publieke caches.
- Fase 2 heeft “Mijn meldingen”, selectie, eerlijk wijzigingssignaal,
  gereviewd correctielog, besloten opt-in-credit en veilige GitHubkoppeling;
  intrekken/verwijderen werkt door naar projecties.
- Fase 3 bewaart menselijke review en de bestaande progressinterface; sync
  heeft expliciet merge/offline-/privacybeleid en houdt anonieme Learn bruikbaar.
- `npm run format`, `npm run check` en relevante e2e slagen; onafhankelijke
  staging/deployment-/worker-/mail-/databasechecks zijn geregistreerd. Publieke
  fase-1-vrijgave via FBK-025 claimt niet dat fase 2/3 al voltooid zijn.

## Voorraad en eerstvolgende slice

Eerst product-/status-/limietbesluiten (DEC-FBK-012/014) voor FBK-001, naast het
hashbesluit DEC-FBK-011 voor FBK-003. Daarna feedback-/privacyconcepten en de
providerproef. MNT-050 wordt hierdoor vervroegd: feedback is zijn eerste concrete
consumer, accountgebonden Learn-progress de tweede. MNT-050 is het platformbesluit,
geen dubbel implementatieticket voor FBK-006–025.

Deze planningsronde implementeert nog geen hashes, accounts, database, mail of
publieke formulieren. De bovenstaande 34 uitvoeringsslices blijven open.
