# Feedbackflow — ontwerpreview

Review-ID: `QCR-2026-10-12-01`. Datum: 2026-10-12.
Scope: `FBK-001`, NL/EN-copy, minimale formulieren, instap, context, uitkomsten,
keyboard, no-JS en responsive presentatie. Uitvoering: Codex binnen de opdracht
om de actuele roadmap voort te zetten. Geen menselijke gebruikerstudie of
productievrijgave; geen geclaimde privacy-/juridische goedkeuring.

## Resultaat

De [lokale proef](../prototypes/feedback/README.md) toont vijf meldsoorten en
drie instappen, met dezelfde kleuren en typografische tokens als de site.
Feitelijke claims vragen een bron of bibliografische verwijzing. Andere soorten
vereisen alleen een toelichting; een andere formulering blijft optioneel.
Er zijn negentien voorbeeldschermen voor ontvangst, detail, beoordeling,
informatievragen/antwoord/deadline, uitkomsten, gewijzigde/verwijderde context,
lege staat, quota, storing, login, werk en bezwaar.

Het [flowcontract](../docs/feedback-flow.md) legt de statusmatrix en
redenwoordenlijst vast. `DEC-FBK-012` is voor het productontwerp besloten;
`DEC-FBK-014` alleen voor formulier/copy. Operationele quota en capaciteit
blijven open. Acceptatie vereist uitvoerbaar werk en claimt geen oplossing.
Hashwijziging is een afzonderlijk signaal; afwijzing geeft geen strike.
Misbruik wordt menselijk beoordeeld, krijgt geen uitkomstmail en behoudt een
bezwaarroute. De daadwerkelijke autorisatie, transacties, mails, strikes en
deadlinebewaking worden pas in de toegewezen implementatietickets gebouwd.

De proef is bewust geïsoleerd van Next-routes en canonical content. Hij bindt
aan loopback, valideert native lokale POSTs en bewaart of mailt niets. Er zijn
geen nieuwe dependencies. Userinput komt niet in redirect-URLs en wordt bij
weergave ge-escaped. Invoer blijft behouden bij gewone validatiefouten,
taalwissel en wijziging van meldsoort. Een oversized/unleesbaar verzoek kan niet
volledig worden hersteld; de bytecap is expliciet onderdeel van het contract.

## Uitgevoerde controles

| Controle | Bewijs en resultaat |
| --- | --- |
| Repositorychecks | `npm run format` en `npm run check` geslaagd: formatting, lint, contentbuild/relationele audit, Next-typegeneratie, TypeScript en 155 unit-tests |
| Prototype-e2e | `npm run test:feedback-prototype`: 34/34 geslaagd, twee Chromium-projecten; desktop zonder JavaScript en mobiele emulatie |
| Formulieren | Alle vijf soorten in NL/EN bereiken ontvangst; ontbrekende feitelijke bron toont gekoppelde fout en behoudt toelichting |
| Conceptbehoud | Taalwissel en andere soort kiezen behouden toelichting via native POST, zonder draft in URL |
| Context en states | Sectie/pagina/algemeen blijven onderscheiden; alle negentien states hebben juiste gelokaliseerde hoofdkop; informatievraag heeft werkend synthetisch antwoordvoorbeeld |
| Keyboard en HTML | Skiplink bereikt hoofdkop; foutlink bereikt bronveld; labels, hints en `aria-invalid` gekoppeld; scripttekst blijft tekst |
| Lokale grenzen | Zes links worden geweigerd; oversized request geeft 413; vreemde Origin geeft 403 |
| Responsive screenshots | Achttien opnames: NL-keuze/formulier/ontvangst en EN-formulier op 320/390/768/1440 CSS-pixels, mobiele validatiefout, extra 720px-reflow met 2× pixeldichtheid; geen horizontale overflow |
| Visuele inspectie | Desktop keuze/ontvangst, tabletkeuze, mobiel formulier/fout, smal Engels en extra reflow beoordeeld: leesbare wrapping, context, veldlabels en acties; geen afgesneden tekst of overlap |

Screenshots en logs zijn tijdelijke lokale QA-artefacten onder
`/tmp/oeno-fbk001-visuals` en `/tmp/oeno-fbk001-*.log`, geen canonical media.
De reproduceerbare testcode staat bij de proef. De reflowsample is geen echte
browserzoomtest; mobiele emulatie is geen fysiek apparaat.

De volledige bestaande app-e2e-suite is deze ronde niet opnieuw uitgevoerd:
de productieapp en content zijn niet gewijzigd. De checks hierboven gelden
voor het ontwerp en de afzonderlijke proef, niet voor een bestaande live
feedbackfunctie. De eerdere 161 app-browsertests blijven historisch bewijs in
de performancereview, niet nieuwe uitslagen van deze ronde.

## Resterende toetsing en vervolg

`FBK-001` is afgerond als productontwerp met toetsbare copy. Echte
proefpersonen, screenreaders, auth/login, mailbezorging, DB-concurrentie,
operationele quota, retentie/rechten en providerstoringen zijn niet getest.
Die controles blijven bij hun implementatieslices en `FBK-025`. Het doel van
indienen binnen 30 seconden is nog niet gemeten; start-/stoppunt en het
anonieme taakprotocol zijn wel vastgelegd in het flowcontract.

Eerstvolgend: `FBK-003`, na concretisering van hashbesluit `DEC-FBK-011`.
`FBK-002/004/005` en platformgate `MNT-050` blijven daarna nodig vóór
databasebouw; publieke lancering wacht op `FBK-025` en `MNT-056`.
