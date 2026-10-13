# CI-afbeeldingen en Next.js — 2026-10-13

Review-ID: `QCR-2026-10-13-02`

## Reikwijdte en methode

Onderzoek naar de door de gebruiker gedeelde GitHub Actions-output: 177
Chromium-tests, twee workers, 172 geslaagd en vijf blijvend falend, inclusief
beide retries. De huidige checkout bevat daarnaast het nog niet gecommitte
wijngaardleerpad (`LRN-017`), waardoor de volledige suite nu 188 tests telt.
Die wijzigingen blijven behouden.

Vergelijk lokale macOS-uitvoering met een geïsoleerde Linux amd64-container
(Debian 12, geëmuleerd op Apple Silicon), Node 24.21.0, npm 11.19.0 en dezelfde
lockfile. Begrens de container tot twee CPU's en 4 GB geheugen. De tijdelijke
`CIRCLE_NODE_TOTAL=2` begrenst ook Next-buildparalleliteit; Docker-CPUquota alleen
veranderen `os.cpus()` niet. Dit verandert geen project- of workflowconfiguratie.
GitHub gebruikt Ubuntu 24.04: de container is een aanvullende Linux-controle,
geen bewijs van een geslaagde externe Actions-run.

## Bevindingen

Alle vijf GitHub-fouten raken geladen afbeeldingen: één no-JS-navigatie blijft
op het `load`-event wachten en vier lescontroles blijven `naturalWidth = 0`
zien. De bestanden zijn aanwezig en Sharp converteert de betrokken PNG's in
Linux in minder dan een seconde. Een warme lokale cache en zelfs een lokale
macOS-run met lege afbeeldingscache reproduceren het probleem niet betrouwbaar.

Next.js 16.3.8 bevat een bekende fout in `fetchInternalImage`: de interne
bestandsresponse deelt de socket van de bezoeker. Wanneer die verbinding
verdwijnt, kan de bestandsstream stoppen zonder de interne response af te ronden.
De gedeelde cachebewerking blijft dan wachten. Latere requests naar dezelfde
combinatie van bron-URL, breedte en kwaliteit blijven eveneens hangen, tot een
serverherstart. Dit verklaart waarom retries het probleem niet oplossen.

Primaire onderbouwing: [upstream issue 96538](https://github.com/vercel/next.js/issues/96538)
en [fix 98168](https://github.com/vercel/next.js/pull/98168). De daadwerkelijk
gepubliceerde package van Next 16.4.0 is gecontroleerd: de interne response
krijgt geen bezoekerssocket meer; de interne request behoudt die wel voor
protocol- en adresdetectie.

Een gecontroleerde HTTP-proef in Linux op 16.3.8 bevestigt het mechanisme:
requests afbreken na 5, 10 of 20 ms maakt latere aanvragen voor precies die
cachekey onbereikbaar binnen drie seconden. Een andere breedte van dezelfde
afbeelding blijft HTTP 200 geven. De proef gebruikt eigen querystrings en raakt
geen echte gebruikersdata. Zonder het originele trace-archief is niet vastgesteld
welke specifieke cachekey als eerste in de gedeelde GitHub-run werd afgebroken.

## Direct gecorrigeerd

`MNT-066`: Next en `eslint-config-next` zijn exact vastgepind op 16.4.0; de
lockfile is bijgewerkt. Beeldoptimalisatie, beeldcontroles, timeouts en retries
in de bestaande suite en workflow blijven ongewijzigd.

`tests/next-image-optimizer.test.ts` gebruikt de echte Next-bestandsstream en
een gewone respectievelijk al verbroken clientverbinding. De test controleert
dat de volledige PNG-bytes aankomen. De tweede case faalt op 16.3.8 en slaagt
op 16.4.0, ook in Linux. Een expliciete deadline maakt een vastloper een
testfout; dit is geen benchmark of vereiste reactietijd voor bezoekers.

## Validatie

- `npm run format` en `npm run check`: geslaagd, inclusief 190 tests in 25 files.
- Linux-regressie op 16.3.8: verbonden client slaagt; verbroken client faalt
  doordat de interne fetch niet eindigt.
- Dezelfde Linux-regressie na `npm ci` op 16.4.0: beide cases geslaagd.
- `npm audit --omit=dev --audit-level=high` in Linux: nul kwetsbaarheden.
- Productiebuild op macOS en Linux: geslaagd op Next 16.4.0, 955 vooraf
  gegenereerde pagina's.
- Volledige lokale Chromium-suite met `CI=true` en `--retries=0`: **188/188
  geslaagd**, twee workers, circa 1,5 minuut.
- HTTP-proef na upgrade, met `Accept: image/webp` zoals de browser: afbreken na
  5, 10, 20 en 40 ms, daarna dezelfde cachekey opnieuw opvragen. Alle vier
  antwoorden zijn HTTP 200 met 38.364 bytes; 680, 728, 554 en 597 ms.
  Een eerste extra proef zonder Accept-header selecteerde tragere PNG-uitvoer
  en overschreed vijf seconden. Dat is geen gelijkwaardige browsermeting.

### Grenzen van de extra Linux-browsercontrole

Chromium in de geëmuleerde amd64-container crasht bij het starten van zijn
GPU-proces (`qemu: uncaught target signal 5`). Daardoor falen 186 browsercases
vóór hun applicatiecontrole; de twee request-only cases slagen. Dit is geen
geslaagde volledige Linux-browserrun.

Een aanvullende run met de werkende macOS-browser tegen de Linux-productieserver
en aanvankelijk lege afbeeldingscache geeft **180/188 geslaagd**, zonder retries,
in circa elf minuten. Zeven fouten zijn navigatie-/stabiliteits-/testtimeouts;
één is een afbeeldingspoll op de Dosage-pagina. De afzonderlijke oorzaken zijn
niet vastgesteld. De oorspronkelijke no-JS-afbeeldingscases slagen in deze run.
Het resultaat is aanvullende diagnostiek en geen groen CI-bewijs. De bestaande
deadlines zijn niet verruimd om deze geëmuleerde omgeving groen te krijgen.

De directe Linux-regressietest en de browser-equivalente HTTP-proef tonen dat
de gevonden vastloper is verholpen. Voor acceptatie van de volledige suite op
native Ubuntu blijft een nieuwe GitHub Actions-run noodzakelijk (`MNT-056`).

De volledige audit bevat vijf high ontwikkelvermeldingen in de bestaande
`braces`/`micromatch`/`fast-glob`/Next-ESLint-keten. Op 2026-10-13 meldt npm nog
`braces` 3.0.3 als nieuwste versie en de
[advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) nog geen patch.
Dit blijft onder `MNT-055`; er is geen ongecontroleerde `audit fix --force`
uitgevoerd.

## Vervolgacties

`MNT-056` bewaart de externe acceptatie: een nieuwe Actions-run na commit/push
moet groen zijn. De ontvangen output bevestigt dat de workflow draait, maar
bevestigt geen branch protection, Vercel-runtime of gedeployde search.
`EXP-032` blijft de eerstvolgende inhoudelijke taak.
