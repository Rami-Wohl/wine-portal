# Atlas uitstellen en contentprioriteit herstellen — 2026-10-30

Review-ID: `QCR-2026-10-30-01`

## Opdracht en reikwijdte

De gebruiker wil Atlas later anders aanpakken, zonder nu een vervangend ontwerp
te kiezen. Verwijder de bestaande implementatie, plaats de Atlastickets
achteraan en geef Leren en Ontdekken weer voorrang.

Bij aanvang stonden de wijzigingen uit MNT-051 nog ongecommit in de checkout.
Die bronreview, inspectie, PNG en twee bronrecords blijven bewaard als onderzoek;
ook de bestaande Pomerol-bronlabelcorrectie blijft behouden. Er was geen typed
geografiemodel, geïmporteerde productiedata, kaartbibliotheek of interactieve
kaart om te verwijderen.

## Uitgevoerd

- `src/app/[lang]/atlas/page.tsx` en `src/styles/atlas.css` verwijderd, inclusief
  stylesheetimport en alle bijbehorende responsive regels.
- Atlas uit de gedeelde desktop-/mobiele navigatie en uit de homepage verwijderd.
  De twee resterende home-ingangen gebruiken gelijke kolommen op brede schermen
  en stapelen op smalle schermen. NL/EN-homecopy en About-metadata beschrijven
  het beschikbare product.
- MNT-002/013/014/070/071 expliciet geparkeerd, als laatste actuele ticketgroep.
  Beschikbare data of afronding van andere tickets hervat deze groep niet.
  Een nieuwe gebruikersopdracht, ontwerpkeuze en bronhercontrole zijn nodig.
- Het oude pilotcontract als historisch voorstel gemarkeerd. Onderzoek kiest
  geen toekomstig ontwerp. De bindende geografische kwaliteitsregels blijven gelden.
- Product-, regionale, Explore-, Learn-, feedback-, routing-, design- en
  projectdocumentatie op hetzelfde besluit aangesloten. Atlasbouw is geen
  voorganger van contentpublicatie of regionale uitbreiding.
- LRN-018 toegevoegd: volgende curriculumbrief, owners/gaps en eerste lessonbatch
  afbakenen. De bestaande curriculumgoedkeuring blijft vóór authoring gelden.
  MNT-072 blijft een urgente correctie van bestaande Pomerol-content en wordt
  onafhankelijk van Atlas uitgevoerd.

Er zijn deze ronde geen nieuwe wijnartikelen, lessen of leerpaden gepubliceerd.
De nieuwe prioriteiten geven hun vervolgleveringen een concrete plek; zij
worden niet als afgerond voorgesteld. Accounts/API/database en feedback blijven
geparkeerd. De verstreken MNT-055-hercontroledatum is zichtbaar als achterstallig,
zonder een nieuwe audit of externe productstatus te suggereren.

## Verificatie

- `npm run format` en `npm run check`: geslaagd, inclusief 192 unit-tests,
  typecheck en de contentbuild met relationele audit.
- Productiebuild (`next build --webpack`): geslaagd.
- Na routeverwijdering wees een achtergebleven `.next/types`-bestand nog naar
  Atlas. Alleen die gegenereerde routecache is verwijderd; de check slaagt.
- Eerste browserrun: 209/211 geslaagd. De twee fouten waren een onjuist
  Nederlands knoplabel in de nieuwe mobiele testselector; gecorrigeerd naar
  de bestaande toegankelijke naam, zonder productcopy te wijzigen.
- Definitieve volledige browsersuite: **211/211 geslaagd zonder retries**,
  twee workers, tegen de productiebuild.
- Nieuwe regressiechecks: NL/EN-home op 320/768/1440px, twee ingangen, gelijkmatige
  kolommen/gestapelde layout, desktop-/mobiele navigatie naar Learn en verdwenen
  Atlaslinks; `/atlas` en `/en/atlas` moeten HTTP 404 retourneren.
- Visuele screenshots bekeken: NL op 320 en 1440px en EN op 768px; twee
  leesbare home-ingangen, passende navigatie en geen afgebroken inhoud.
  Ook de huidige homepage in de in-app browser bekeken.
- Productieroutemanifest bevat geen Atlaspagina. De lokale productiepreview
  draait op `http://127.0.0.1:3101`.
- Alle 72 MNT-identiteiten uniek: 8 open, 4 geblokkeerd, 5 geparkeerd en 55 afgerond.
  De volledige roadmap telt 60 niet-afgeronde tickets, inclusief het nieuwe LRN-018.
- Lokale bestandslinks in gewijzigde actuele documentatie gecontroleerd.

## Vervolg

MNT-072 voor bestaande bronkwaliteit; LRN-018 voor het volgende curriculumvoorstel;
EXP-027/028 en vervolgens de resterende EXP-032-batches voor Ontdekken.
De actuele status blijft in de domeinbacklogs, niet in dit gedateerde rapport.
