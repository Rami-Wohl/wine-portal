# Learn-pilotrelease

Status: publiek en in observatie  
Productie-URL: [`https://wine-portal.vercel.app`](https://wine-portal.vercel.app)  
Publicatiedatum: 2026-09-23  
Release-revisie: `50b1cb5` (`feat: improvements after learn functionality qa audit`)

## Gepubliceerde scope

De anonieme pilot bevat het actieve leerpad **Van druif naar stille wijn — hoe
wijn wordt gemaakt**, de zeven kernlessen, canonical Explore-naslag, lokale
voortgang en de afsluitpagina. Accounts, remote opslag, quizzen en certificaten
maken geen deel uit van deze release.

De productiecontrole bevestigde HTTP 200 voor de catalogus, het leerpad, de
eerste lesson, de afsluiting en een gekoppelde canonical entitypagina. De
volledige niet-destructieve Learn-Playwrightsuite controleert daarnaast alle
lessons, navigatie, lokale voortgang, storagefallbacks, media, interne links,
responsive gedrag, focus en Learn–Explore–Learn rechtstreeks op productie.
Alle 17 scenario's slaagden op 24 september 2026. Aanvullende visuele controle
van de live leerpadpagina op 375 CSS-pixels en een volledige lesson op 1440
CSS-pixels liet geen clipping, horizontale overflow of ontbrekend beeld zien.

## Privacy en observatie

Deze pilot voegt geen analytics, trackingpixel of remote progressopslag toe.
Voortgang blijft uitsluitend in de browser van de gebruiker staan. De eerste
evaluatie gebruikt daarom kwalitatieve waarnemingen en expliciete feedback:

- vindt de gebruiker het leerpad en begrijpt die vooraf doelgroep en opbrengst;
- is de lesvolgorde logisch zonder aanvullende uitleg;
- kan de gebruiker naslag openen en de route hervatten;
- zijn voltooien, heropenen, refresh en hervatten begrijpelijk;
- geeft de afsluiting een geloofwaardige samenvatting en volgende stap;
- welke inhoud voelt te kort, te lang, te eenvoudig of te specialistisch.

De minimale observatieperiode loopt van 23 september tot en met 21 oktober
2026. `LRN-012` begint pas daarna én alleen wanneer er voldoende werkelijk
gebruik of gerichte gebruiksgesprekken zijn geweest. Bij onvoldoende bewijs
wordt de observatieperiode verlengd; afwezigheid van data is geen positief
signaal.

## Herhaalbare productiecontrole

Voer vanuit een schone checkout van de releaserevisie uit:

```bash
npm ci
npm run check
npm run test:e2e:live
```

De live-suite gebruikt `PLAYWRIGHT_BASE_URL`, start geen lokale Next-server en
muteert uitsluitend local storage in een geïsoleerde browsercontext.

## Herstel en rollback

Bij een productieprobleem:

1. bepaal eerst of het probleem alleen de Vercel-deployment of ook de
   releaserevisie raakt;
2. redeploy in Vercel de laatst bekende werkende deployment wanneer de code
   correct is maar de deployment zelf is mislukt;
3. maak bij een code-regressie een normale `git revert` van de veroorzakende
   commit en laat `main` opnieuw deployen; herschrijf de gedeelde geschiedenis
   niet;
4. voer na herstel de HTTP-controle en `npm run test:e2e:live` opnieuw uit;
5. leg oorzaak, gekozen herstel en nieuwe productierevisie in dit document vast.

De directe voorganger van deze release is `6da7a75`. Dat is een technisch
rollbackpunt, geen voorkeursoplossing: deze revisie mist de latere integrale
Learn-QA-correcties.

## Releasehistorie

| Datum | Revisie | Resultaat |
| --- | --- | --- |
| 2026-09-23 | `50b1cb5` | Anonieme Learn-pilot publiek; lokale voortgang, zeven lessons en integrale QA-correcties aanwezig |
