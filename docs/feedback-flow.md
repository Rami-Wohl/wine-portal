# Feedbackflow en ontwerpcontract

Vastgelegd: 2026-10-12, uitvoeringsresultaat van `FBK-001`.
Ticketstatus en besluiten staan uitsluitend in de [feedbackroadmap](feedback-roadmap.md).
Dit document beschrijft het gekozen productontwerp; het is geen publieke privacytekst.
Het spoor is sinds 2026-10-12 bewust geparkeerd. De
[overdracht en hervatvoorwaarden](feedback-roadmap.md#prioriteit-en-hervatpunt--besluit-2026-10-12)
zorgen dat dit ontwerp later opnieuw beoordeeld en geïntegreerd kan worden.

## Beoordeelbare proef

Start `npm run prototype:feedback` en open [de Nederlandse proef](http://127.0.0.1:3102)
of [de Engelse proef](http://127.0.0.1:3102/en). De
[voorbeeldpagina](http://127.0.0.1:3102/?screen=article) toont de drie instappen.
De proef gebruikt dezelfde huisstijltokens als de site, maar draait afzonderlijk
op loopback. De bestaande Next-routes, navigatie en content blijven ongewijzigd.

Formulieren versturen invoer via een lokale POST voor validatie. De server
houdt die alleen tijdens het verzoek in geheugen en geeft foutieve invoer terug
in het formulier. Er zijn geen accounts, database, bestanden met inzendingen,
mail, externe API-aanroepen of requestbodylogs. Gebruik uitsluitend synthetische
voorbeeldtekst. Uitkomstschermen zijn rechtstreeks bereikbare ontwerpvoorbeelden;
een bevestiging bewijst hier geen opgeslagen melding. Na succesvolle validatie
volgt een redirect zonder meldtekst in de URL. Een refresh/herstart bewaart geen
concept; er is geen autosave.

De leesbare NL/EN-voorbeeldcopy staat in
[copy.ts](../prototypes/feedback/copy.ts); route-/formuliercopy staat in
[render.ts](../prototypes/feedback/render.ts). Deze bestanden zijn de uitvoerbare
ontwerpvoorbeelden, geen tweede productiecatalogus. Bij productintegratie volgt
copy het centrale lokalisatiecontract en `MNT-061`.

## Instap en minimaal formulier

- **Sectie:** rustige actie bij hover of toetsenbordfocus; op touch altijd
  zichtbaar. De echte functie richt zich op het owner-block, ook bij embeds.
- **Pagina:** apart melden over de pagina als geheel, zonder verzonnen block-ID.
- **Algemeen:** platformidee zonder fictieve contentidentiteit. De
  voorbeeldinstap kiest de suggestiesoort alvast; wisselen blijft mogelijk.

Stap 1 kiest één van vijf soorten. Stap 2 vraagt één toelichting, een bron en
eventueel een andere formulering. Voor feitelijke fouten is een bron verplicht:
een URL **of** bibliografische verwijzing volstaat als invoer. Dat maakt de bron
nog geen bewijs; een redacteur moet de claim onderzoeken. Voor uitleg,
vertaling, defect en suggestie is de bron optioneel. Een formulering voorstellen
staat ingeklapt en is nooit verplicht. Er zijn geen bijlagen of publieke reacties.

De context noemt pagina, eventuele sectie en gelezen taal; interne IDs/hashes
verschijnen niet in gebruikerscopy. Op desktop staat context naast de tekst, op
kleine schermen erboven. De waarschuwing om geen persoonsgegevens te schrijven
blijft ook in het mobiele formulier zichtbaar. Login wordt later toegevoegd;
publiek lezen blijft zonder account mogelijk.

Validatiefouten tonen een samenvatting met veldlinks, veldtekst en
`aria-invalid`/`aria-describedby`. Invoer blijft behouden bij normale
validatiefouten, taalwissel en wijziging van meldsoort. Focusbare skiplink,
native controls en POST-formulieren werken zonder JavaScript. Te grote of
onleesbare requests kunnen niet volledig worden teruggetoond; de latere
productieflow moet dat verlies begrijpelijk melden, niet autosave beloven.

## Statusmatrix — DEC-FBK-012

Dit is het gekozen ontwerp, vastgesteld door Codex binnen de gedelegeerde
uitvoering van 2026-10-12. Het is geen bewijs van een menselijke gebruikerstest.
De acht interne statusnamen en NL/EN-labels staan in het
[uitkomstcontract](feedback-roadmap.md#uitkomst--en-notificatiecontract).
De prototypecodes `review` en `fixed` tonen respectievelijk `in_review` en
`fixed_directly`; detail-, fout- en hulpschermen zijn geen extra DB-statussen.

| Van | Naar | Vereiste |
| --- | --- | --- |
| `received` | `in_review` | Redacteur neemt de melding in behandeling |
| `received`, `in_review`, `needs_info` | `abuse` | Menselijk gemotiveerd misbruikbesluit; geen uitkomstmail |
| `in_review` | `needs_info` | Concrete vraag; maximaal één antwoordronde per melding |
| `needs_info` | `in_review` | Eén geldig antwoord, of menselijke vervolgbeoordeling na deadline |
| `in_review` | `accepted`, `duplicate` | Bestaand en gecontroleerd werk, met veilig zichtbare samenvatting/link |
| `in_review` | `fixed_directly` | Gereviewde gepubliceerde correctie, commit en correctierecord |
| `in_review` | `declined` | Menselijke reden; geen strike |
| `accepted`, `duplicate` | `fixed_directly` | Gekoppelde correctie daadwerkelijk gepubliceerd en gecontroleerd |
| `accepted`, `duplicate`, `fixed_directly`, `declined`, `abuse` | `in_review` | Uitzonderlijke menselijke herroeping met reden en verwijzing naar vorig besluit; nooit automatisch |

Alle andere overgangen zijn ongeldig. Bij heropening geldt opnieuw de
uniciteitscontrole; een inmiddels bestaande open melding moet eerst handmatig
worden samengevoegd/afgehandeld. Heropening geeft geen tweede antwoordronde.
Herroeping van misbruik herstelt bijbehorende strike/counters via `FBK-020/021`.
De concrete DB-, autorisatie-, concurrency- en mailtests volgen in `FBK-017–021`.

**Open** betekent alleen `received`, `in_review` of `needs_info`. Acceptatie
is een teruggekoppelde uitkomst met uitvoerbaar werk, geen gepubliceerde oplossing.
Een gewijzigde, verwijderde of onbekende sectie is een afzonderlijk
`change_state`, nooit een menselijke behandelstatus. Geen hash mag automatisch
een melding oplossen. De mailcopy belooft nog geen vaste reactietermijn.
Bij misbruik komt geen uitkomstmail; accountwaarschuwingen en een menselijke
bezwaarroute blijven onderdeel van het toekomstige ontwerp.

De beheerde afwijsredenen zijn: bron onderbouwt claim niet; huidige uitleg klopt
binnen scope; voorstel valt buiten deze pagina; technisch probleem niet
reproduceerbaar; onvoldoende informatie. De gelijkwaardige Engelse formuleringen
staan bij `declineReasons` in `copy.ts`. De redacteur kiest een passende reden
en kan een gecontroleerde toelichting toevoegen. Geen reden geeft automatisch
een strike of maakt een gebruikersbron canonical.

## Formuliergrenzen — productdeel DEC-FBK-014

| Onderdeel | Ontwerpkeuze |
| --- | --- |
| Toelichting en één antwoord | 30–4000 tekens na trimmen |
| Bronverwijzing | Maximaal 2000 tekens; verplicht bij feitelijke fout |
| Optionele formulering | Maximaal 2000 tekens |
| Links | Maximaal 5 over alle tekstvelden samen |
| Request | Maximaal 16 KiB; bytegrens gaat vóór afzonderlijke tekenlimieten |
| Antwoordronde | Eén antwoord binnen 14 dagen na informatieverzoek; daarna menselijke vervolgbeoordeling |
| Reactietijd | Geen beloofde SLA; eventuele streeftermijn pas na capaciteitstoets |

Dit sluit alleen het product-/copydeel van `DEC-FBK-014`. Gebruikers-, IP- en
globale operationele quota, providerlimieten en capaciteit blijven open voor
`FBK-004/005/008/014/025`. De voorgestelde 5 meldingen/uur en 20/dag zijn nog geen
vrijgegeven runtimebeleid. De quotegrens van 1000 tekens hoort bij de latere
selectieflow `FBK-026`, niet bij dit formulier. Retentie, strikes, rechtsgrond,
beheercontact en providers zijn niet besloten door deze ontwerpproef.

## Taakproef en acceptatie bij lancering

De lokale ontwerpreview controleert beide talen, vijf soorten, bronplicht,
normale foutafhandeling, taal-/soortwissel, context, één antwoordvoorbeeld,
uitkomsten, lege state, quota, storing, login, deadline, misbruik en bezwaar.
Het [reviewrapport](../editorial/feedback-flow-review-2026-10-12.md) onderscheidt
uitgevoerde browser-/visuele checks van nog niet uitgevoerde gebruikersproeven.

De **30 seconden** blijven een te toetsen succesdoel, geen gemeten uitkomst.
Meet in `FBK-025` met echte proefpersonen op de geïntegreerde flow: reeds
ingelogd, betreffende pagina open en bron paraat; start bij de meldactie en stop
bij bevestigde ontvangst. Typen en het kiezen van een bron tellen mee; de
voorafgaande login en research niet. Laat per soort een concrete synthetische
taak uitvoeren op desktop en mobiel, inclusief toetsenbord en zonder JavaScript.
Vraag daarna welke context/status/bronplicht de persoon begreep. Noteer alleen
geaggregeerde duur, slagen/mislukken en anonieme observaties, geen inzendingen
of persoonskenmerken in Git. Pas onduidelijke copy aan vóór lancering.

Een geautomatiseerde clickflow vervangt geen proef met mensen of echte
screenreader. De latere auth-, mail-, privacy- en launchgates blijven gelden.
