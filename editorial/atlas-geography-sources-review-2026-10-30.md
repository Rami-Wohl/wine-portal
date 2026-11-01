# Atlas-geografie: bronnen opnieuw vastgepind en appellationgebieden geïmporteerd — 2026-10-30

Review-ID: `QCR-2026-10-30-01`

## Reikwijdte en methode

Fase 2 van het [Atlas-implementatiecontract](../docs/atlas-plan.md) vraagt de
geo-data-agent om de bronnen opnieuw vast te pinnen, de fetch- en importscripts
te bouwen en de productiegebieden van alle actieve Franse appellations met
volledige provenance te importeren. Dit rapport bewaart de bronbeslissingen, de
identiteitsmapping, de geometrische controles en de publicatiebeoordeling. De
meetwaarden per feature staan in het
[inspectiebestand](measurements/atlas-geography-sources-inspection-2026-10-30.json).
Hydrografie, plaatsen en scènes volgen in een volgende ronde.

Gecontroleerd en daadwerkelijk gedownload: de data.gouv.fr-API van de
INAO-dataset en -organisatie, de shapefile-ZIP van 26 oktober 2026, het
INAO-productregister van 31 december 2025, de INAO-gemeentelijst van 9 oktober
2025 (vergelijking), de APIZPI-export van 26 oktober 2026 (alleen ter controle
van het attribuutverlies, niet gebruikt), de GetCapabilities van de
IGN-Géoplateforme-WFS, de Licence Ouverte 2.0 en het cahier des charges van de
AOC Côtes de Bordeaux (BO Agri, 11 juni 2026). Geen screenshottracing, geocoding
of generatieve geografie; geen geometrie samengevoegd, hersteld of vereenvoudigd.
Projectdependencies zijn niet gewijzigd.

## Bronbesluit: editie 2026-10-26 vervangt 2026-10-12

De op 2026-10-14 onderzochte editie van 2026-10-12 (88.984.476 bytes, SHA-256
`e9ea8b48…`) wordt niet meer aangeboden: de statische URL geeft HTTP 404 en het
Internet Archive heeft geen kopie. INAO heeft de resource
`687d62d7-8ee6-4997-a47a-81e3183be31b` onder hetzelfde identifier in situ
vervangen door de editie van 2026-10-26 (publicatiefrequentie: wekelijks). Er
is dus maar één editie die vastgepind kan worden. Het besluit is de editie van
2026-10-26 te pinnen; de oude provenance blijft bewaard in het
[rapport van 2026-10-14](atlas-bordeaux-data-review-2026-10-14.md) en in het
`superseded_edition`-blok van het inspectiebestand. De bronrecord
`source.inao-geographical-areas-2026` vermeldt nu de editie van 26 oktober en
dat die de editie van 12 oktober onder hetzelfde resource-id vervangt.

## Bestand, CRS en rechten

Dataset-ID `5d7fb2856f444171a5f2780b`, resource-ID
`687d62d7-8ee6-4997-a47a-81e3183be31b`, bestand
`2026-10-26-delim-aire-geographique-shp.zip`, 88.937.803 bytes, SHA-256
`36b95bd8e88dc0412c1e83c917907527105dc710d60f4d381502dcf0ec2551ef`; de
catalogus-SHA-1 `103ebe8d…` komt overeen met de lokaal berekende waarde. De ZIP
bevat één SHP/SHX/DBF-set, een PRJ en een CPG (UTF-8); de membernamen en
-groottes staan in `data/geography/manifest.yaml`. De PRJ is byte-voor-byte
gelijk aan de WKT van de editie van 12 oktober (RGF93 / Lambert-93, meters;
IGNF:LAMB93, equivalent aan EPSG:2154) en staat verbatim in het manifest.

Licentie: **Licence Ouverte 2.0**. De licentietekst eist vermelding van de
licentiegever en de datum van de laatste update, en verbiedt de suggestie van
officiële goedkeuring. De attributie in elk record luidt daarom "INAO,
Délimitation des aires géographiques des SIQO, édition du 26 octobre 2026". De
datasetbeschrijving op data.gouv.fr herhaalt dat de vormen informatief zijn en
dat de gemeentelijst in het cahier des charges de officiële afbakening is; die
waarschuwing staat in `licence.notes` en `limitations` van elk record.

## Attribuutverlies in de editie van 2026-10-26

In de nieuwe editie zijn in alle 1.852 DBF-records alleen `type_denom` en
`denom` gevuld; `dt`, `signe`, `id_app`, `app`, `id_denom`, `categorie` en de
gemeentevelden bestaan nog als kolommen maar zijn in elk record leeg. Dit is op
byteniveau gecontroleerd, onafhankelijk van de shapefile-bibliotheek. De
APIZPI-export van dezelfde dag heeft die velden wél gevuld (594 van 596
records), dus het gaat om een exportfout in dit ene bestand, niet om een
schemawijziging. Het aantal records (1.852) en de PRJ zijn ongewijzigd; voor de
negen op 2026-10-14 geïnspecteerde features zijn geometrietype, vertexaantal en
native bbox identiek aan de vorige editie.

Het contract eist matching op het geverifieerde identifierpaar én beide labels.
Omdat de editie het paar niet draagt, is de identiteitsautoriteit verlegd naar
het INAO-productregister (dataset `69538fa5e19db626e660563d`, resource
`76e54568-9786-4e15-8e48-dc3b8f44011d`, extractie 2025-12-31, 1.114.747 bytes,
SHA-256 `f095783b…`, 5.246 rijen, Licence Ouverte 2.0), dat per product
`id_appellation`, `appellation`, `id_denomination_geo`, `denomination` en
`signe_fr` levert. De namespace is dezelfde als die van de shapefile: alle
negen paren uit de inspectie van 2026-10-14 (Pauillac 59/118, Bordeaux 14/67,
Margaux 52/111, Saint-Julien 71/168, Saint-Estèphe 69/166, Pomerol 62/121,
Saint-Emilion 67/162, Barsac 8/60, Sauternes 75/172) komen exact terug. Het
register is als tweede resource vastgepind en wordt door de import gelezen.

De import matcht per entry op `type_denom` en `denom` (exacte strings; voor
alle 39 entries uniek in deze editie), weigert ontbrekende, dubbele of
tegensprekende records, verifieert elk sleutelveld dat wél aanwezig is, en
controleert `id_app`/`id_denom`/`app`/`denom`/`signe` tegen het register,
inclusief een ambiguïteitscontrole op het label. De vijf dubbele
`type_denom`/`denom`-paren in het bestand (onder meer Valençay, kaas en wijn)
raken geen gemapt feature. Elk record vermeldt in `review.notes` welke
DBF-velden geverifieerd zijn en welke in deze editie leeg waren. Dit is
zwakkere identiteitsevidentie dan het contract beoogt; het is expliciet
vastgelegd en de orchestrator beslist of een latere, gecorrigeerde editie een
herimport rechtvaardigt.

Alternatieven zijn onderzocht: de IGN-Géoplateforme-WFS serveert alleen
`AOC-VITICOLES:aire_parcellaire` (perceelafbakening, andere betekenis); de
INAO-site biedt per product alleen PDF-kaarten; er is geen andere distributie
van de aires géographiques met attributen gevonden.

## Identiteitsmapping

`data/geography/mappings/inao-appellations.yaml` bevat 39 entries voor de 39
actieve Franse appellation-entities (alle actieve appellations behalve Port en
Sherry). Besluiten voor de lastige gevallen:

| Geval                                                          | Besluit                                                                                                                                                                                                                             |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bordeaux / Bordeaux supérieur / Crémant de Bordeaux            | Drie eigen bronrecords (14/67, 585/1740, 31/89) met identieke coördinaten; elke entity wijst naar haar eigen record. Komt overeen met 501 gemeenten in elk van de drie gemeentelijsten.                                              |
| Saint-Emilion / Saint-Emilion grand cru                        | Twee eigen records (67/162, 68/163) met identieke coördinaten; geen vorm geleend. Negen gemeenten in beide lijsten.                                                                                                                 |
| Graves / Graves supérieures                                    | Twee eigen records (37/96, 855/2037) met identieke coördinaten; één cahier des charges.                                                                                                                                             |
| Côtes de Bordeaux en de complementaire benamingen              | Het `appellation`-record 685/1849 voor de entity Côtes de Bordeaux; de vijf benamingen zijn eigen records van het type `dénomination géographique complémentaire` met label "Côtes de Bordeaux Blaye/Cadillac/Castillon/Francs/Sainte-Foy" (685/2079, 2077, 2078, 2080, 2825). |
| Cadillac / Cadillac Côtes de Bordeaux                          | Verschillende records (20/76 en 685/2077) met verschillende vormen; Cadillac is de zoete witte AOC (22 gemeenten).                                                                                                                  |
| Médoc / Haut-Médoc                                             | Verschillende records (53/112 en 39/98); de Médoc-vorm bevat de Haut-Médoc-vorm, zoals de gemeentelijsten (29 van 29).                                                                                                              |
| Entre-deux-Mers en Haut-Benauge                                | Het `appellation`-record 32/90; "Entre-deux-Mers Haut-Benauge" en "Bordeaux Haut-Benauge" zijn complementaire benamingen zonder entity en worden niet gebruikt.                                                                      |
| Champagne                                                      | Het `appellation`-record 5/55 (9 delen, 11.173 vertices); "Champagne grand cru" en "Champagne premier cru" zijn eigen records en worden niet gebruikt.                                                                               |
| Côtes de Bourg, Moulis, Canon Fronsac, Lussac, Puisseguin      | INAO-labels wijken af van de entitynamen ("Côtes de Bourg, Bourg et Bourgeais", "Moulis ou Moulis-en-Médoc", "Canon Fronsac"); Lussac en Puisseguin staan in het register zonder koppelteken en in de shapefile met. Beide spellingen zijn vastgelegd. |
| Barsac / Sauternes                                             | Twee records; Barsac ligt geheel in of op de rand van de Sauternes-vorm (0 m buiten). Geen containmentrelatie afgeleid.                                                                                                             |

`dt`, mapnamen en rijposities zijn nergens identiteit; de rijpositie staat
alleen als inspectielocator in het inspectiebestand.

## Geometrische controle

| Controle                                                                | Waarneming                                                 |
| ----------------------------------------------------------------------- | ---------------------------------------------------------: |
| Records in de landelijke bron                                           |                                                      1.852 |
| Gemapte entries / geschreven records                                    |                                                    39 / 39 |
| Geldig vóór en na reprojection (incl. simpele ringen, holes in exterieur) |                                                    39 / 39 |
| Vertices in de 39 records                                               |                                                     63.392 |
| Polygon / MultiPolygon                                                  |                                                     35 / 4 |
| GeoJSON-bytes totaal (prettier-geformatteerd)                           |                                                  2.306.350 |
| Afwijking PRJ-WKT t.o.v. PROJ-definitie EPSG:2154 over de bestands-bbox |                                              2,1 × 10⁻¹⁴ ° |
| Afwijking bbox van de negen features t.o.v. pyproj-referentie 2026-10-14 |                                                 ≤ 5 × 10⁻⁹ ° |
| Holes die hun exterieurring raken / erbuiten liggen / randen die kruisen (hele bestand; kruisingen gemeten 2026-10-31) |                                                    119 / 0 / 0 |

Reprojection gebeurt met proj4 vanuit de verbatim PRJ-WKT naar lon-lat
(`+proj=longlat +datum=WGS84`), zonder datumverschuiving (RGF93 wordt als
WGS 84 behandeld; verschil onder een meter). Een onafhankelijke evaluatie van
de Lambert-conformeconische formules (EPSG-methode 9802) komt tot 10⁻¹⁰ graad
overeen. Ringoriëntatie volgt RFC 7946: alle 221 ringen zijn in volgorde
omgekeerd (de shapefile-conventie is het spiegelbeeld van RFC 7946), geen
coördinaat is gewijzigd. Coördinaten zijn na reprojection afgerond op
8 decimalen (circa 1 mm, de resolutie van de bron in meters); 7 decimalen zou
één bronsegment van 2 mm tot een dubbel vertex samenvoegen. Het contract heeft
geen transformatiestap voor afronding; de afronding staat daarom in
`review.notes` van elk record (zie openstaande punten).

Consistentiecontroles in Lambert-93 (vertex-in-polygon met afstand tot de
rand voor randvertices): alle Bordeaux-clustervormen liggen in of op de rand
van de Bordeaux-AOC-vorm (maximale afstand buiten 0,22 m); Haut-Médoc in Médoc,
Canon Fronsac in Fronsac, Pessac-Léognan en Cérons in Graves, Listrac, Moulis,
Pauillac, Margaux, Saint-Julien en Saint-Estèphe in Haut-Médoc (≤ 0,29 m);
Sauternes steekt tot 2,5 km buiten Graves, wat strookt met de gemeentelijsten
(geen Sauternes-gemeente in de Graves-lijst). Moulis polygon 37 bevat twee
sliver-holes van 0,3 en 0,2 m² die de exterieurring raken; dat is brongeometrie
en is ongewijzigd overgenomen.

## Publicatiebeoordeling

38 records `published`, 0 `reviewed`, 1 `held`. Publicatie is per record
gebaseerd op: exacte labelmatch in de DBF, registerbevestiging van paar,
labels en sign, type-/categoriecongruentie, en de geometrische
consistentiecontroles hierboven; voor de negen eerder geïnspecteerde features
bovendien gelijk paar, vertexaantal en native bbox als in de editie van
2026-10-12. Champagne heeft geen omsluitende vorm of eerdere sleutelcontrole;
de publicatie steunt op het unieke label, het register en de extentcontrole
(9 losse delen, 47,9–49,5° N, 3,1–4,9° O, consistent met 635 gemeenten in
Marne, Aube, Aisne, Haute-Marne en Seine-et-Marne). Dat staat in het record.

**Held: `geo.appellation-area.cotes-de-bordeaux`.** De identiteit is bevestigd,
de reikwijdte niet: de MultiPolygon (3 delen) dekt de sectoren Blaye, Cadillac,
Castillon en Francs (elke benamingsvorm ligt erin, maximaal 0,013 m buiten) en
niets van de sector Sainte-Foy (alle 1.248 vertices van "Côtes de Bordeaux
Sainte-Foy" liggen erbuiten, tot 26,4 km). Het cahier des charges (BO Agri
11 juni 2026, hoofdstuk I, IV.1°a, gelezen uit de PDF) en de INAO-gemeentelijst
(111 gemeenten) nemen de 19 Sainte-Foy-gemeenten wél op in het appellationgebied.
Er is geen union van de sectorvormen gemaakt. Het record is geschreven met
status `held` en reden; de entity draagt wel `geography_id`, zoals de
pipelinevalidatie eist. Het Sainte-Foy-record zelf is gepubliceerd.

## Scripts en reproduceerbaarheid

- `scripts/geography/fetch.ts` leest het manifest, downloadt elke resource
  streaming naar `data/geography/cache/<id>/`, controleert bytes en SHA-256,
  slaat geverifieerde bestanden over en vervangt nooit een afwijkend bestand
  (de run faalt met pad en waargenomen waarden). Opties `--verify`, `--only=`.
- `scripts/geography/import.ts` controleert eerst de cache tegen het manifest,
  pakt de ZIP uit (fflate), vergelijkt members, PRJ en CPG met het manifest,
  leest DBF/SHP (shapefile, UTF-8), matcht volgens de mappingtabel, valideert
  native en na reprojection, schrijft GeoJSON en YAML via prettier (zodat
  `npm run format` de checksums niet breekt) en atomair; bij één mislukte entry
  wordt niets geschreven. Optie `--dry-run`. Een tweede run meldt 39 ×
  `unchanged`.
- Unit-tests: `scripts/geography/fetch.test.ts` (verificatie, download,
  mismatch, idempotentie) en `scripts/geography/import.test.ts` (ringvalidatie,
  oriëntatie, asvolgorde, projectie-overeenstemming, matching op ontbrekend/
  dubbel/tegensprekend record, registercontrole, DBF-lezen uit een in-test
  geschreven shapefile, checksum, corrupte invoer, end-to-end import in een
  tijdelijke root, en de gecommitte mappingtabel).

## Openstaande punten

1. Het geografierecordschema (`src/content/model/geography.ts`) kent alleen de
   transformatiestappen `reproject`, `ring-orientation` en `clip`. De
   coördinaatafronding is een echte transformatie en hoort als stap vastgelegd
   te worden; nu staat zij in `review.notes`. Voorstel: een stap
   `{ step: coordinate-precision, decimals: 8, unit: degree }` toevoegen en de
   records opnieuw genereren.
2. Zodra INAO een editie publiceert waarin `id_app`/`id_denom` weer gevuld
   zijn, verdient een herimport met volledige sleutelmatching de voorkeur; het
   manifest en de mapping zijn daarop voorbereid (aanwezige sleutelvelden
   worden al geverifieerd).
3. Het held-record Côtes de Bordeaux vraagt een vraag aan INAO of een latere
   editie; tot die tijd toont een scène dit gebied niet.
4. Hydrografie, plaatsen en scènes zijn nog niet geïmporteerd.

## Verificatie

- `npm run geography:fetch`: beide resources gedownload en geverifieerd
  (88.937.803 bytes / SHA-256 `36b95bd8…`; 1.114.747 bytes / SHA-256
  `f095783b…`); tweede run: `verified`, niets opnieuw gedownload.
- `npm run geography:import`: eerste run weigerde te schrijven omdat Moulis
  polygon 37 twee holes heeft die de exterieurring raken en de holecontrole
  alleen het eerste vertex testte; na een exacte in-of-op-rand-test voor alle
  holevertices: 39 records geschreven (38 published, 1 held); derde run:
  39 unchanged.
- `npx vitest run scripts/geography/`: 56 tests geslaagd (3 bestanden,
  inclusief de geometrietest van de build-agent).
- `npm run content:check`: geslaagd — 372 entities, 16 narratives, 2 learning
  paths, 636 sources, 190 media assets, met de geografievalidatie van de
  contentpipeline (checksum, vertexaantal, bbox, ringoriëntatie, eigenaarschap).
- `npx eslint` en `npx tsc --noEmit` zonder meldingen voor de geografiescripts;
  `npx prettier --check` geslaagd voor `data/geography`, de nieuwe bronrecords,
  het inspectiebestand en de scripts.

De gegevens zijn werkelijk gedownload, gelezen en gecontroleerd. Dit rapport is
geen officiële bevestiging van juridische grensjuistheid; de INAO-vormen blijven
informatieve geometrie op het niveau van regionale oriëntatie.

---

# Aanvulling 2026-10-31: hydrografie, plaatsen, scènes en precisiestap

Review-ID: `QCR-2026-10-31-01`. Meetwaarden per record staan in het
[inspectiebestand van 31 oktober](measurements/atlas-orientation-sources-inspection-2026-10-31.json).

## Bronkeuze en verkrijging

IGN verspreidt BD CARTO®, BD TOPO® en ADMIN EXPRESS als bulkbestanden in
7z-archieven; op deze machine is geen 7z-extractor beschikbaar en er mogen geen
systeemtools worden geïnstalleerd. Daarom is de regel uit contract §6 voor
service-only bronnen toegepast: de gegevens zijn opgehaald met vastgepinde
WFS 2.0.0 GetFeature-verzoeken op de IGN-Géoplateforme (`data.geopf.fr/wfs/ows`,
uitvoer GeoJSON, `SRSNAME=EPSG:2154`, `SORTBY=cleabs`, CQL-filter) en de ruwe
antwoorden zijn gecommit onder `data/geography/raw/<dataset-id>/` met bytes en
SHA-256 in het manifest. Twintig antwoorden, samen 8,8 MB, het grootste 1,79 MB
(kustlijn); alle onder de limiet van 10 MiB. Een tweede opvraging op 2026-10-30 en
een derde op 2026-10-31 (`npm run geography:fetch -- --capture-raw`) leverden
inhoudelijk identieke antwoorden; alleen de `timeStamp` van de server verschilt,
en die wordt bij vergelijking genegeerd. Natural Earth was niet nodig.

| Bron | Laag/edition | Licentie | CRS |
| --- | --- | --- | --- |
| IGN BD CARTO® V5 (`source.ign-bd-carto-v5-2026`) | `BDCARTO_V5:troncon_hydrographique`, `plan_d_eau`, `limite_terre_mer`; editie 2026-03-15 volgens de laagbeschrijvingen van de service; schaal 1:50 000–1:250 000 (CSW) | Licence Ouverte / Open Licence 2.0 (CSW-record `IGNF_BD-CARTO`, `otherConstraints`; data.gouv.fr-dataset `675871b46e60265b46ab3562`, licentie `lov2`) | opgevraagd in EPSG:2154 (`urn:ogc:def:crs:EPSG::2154` in elk antwoord) |
| IGN ADMIN EXPRESS COG 2026 (`source.ign-admin-express-cog-2026`) | `ADMINEXPRESS-COG.2026:chef_lieu_de_commune`; code officiel géographique au 1er janvier 2026 (laagbeschrijving: "édition 2026-01-01"; zie aanvulling 2026-10-31, tweede deel) | Licence Ouverte / Open Licence 2.0 (CSW-record `IGNF_ADMIN-EXPRESS`; data.gouv.fr-dataset `5808de39c751df1e0679df72`, `lov2`) | idem |

BD CARTO is gekozen boven BD TOPO omdat zijn generalisatieniveau past bij
regionale oriëntatie en de canonical records volledige bronvertices bewaren.
De IGN-Géoplateforme-WFS biedt geen BD CARTO-coördinaten in WKT; de
`crs`-URN van het antwoord staat verbatim in het manifest en wordt door de
import gecontroleerd, samen met de PROJ-definitie van EPSG:2154.

## Envelopes

Vastgelegd in `manifest.yaml` onder `envelopes`, in WGS 84 én als omhullende
rechthoek in Lambert-93 (de CQL-`BBOX` gebruikt die rechthoek):

- `bordeaux`: [-1,50, 44,10, 0,55, 45,80] — de unie van de 38 Bordeaux-bboxen
  [-1,1695, 44,3241, 0,3151, 45,5736], circa 0,3° naar het westen verruimd voor
  kust en Bassin d'Arcachon en 0,22° elders;
- `champagne`: [2,90, 47,70, 5,15, 49,70] — de Champagne-bbox circa 0,24° verruimd.

Selectie gebeurt op hele bronfeatures die de envelope snijden (BBOX in CQL);
er is niet geknipt, dus geen `clip`-stap. Rivieren en kustlijn komen als
BD CARTO-tronçons: alle segmenten met exact de genoemde naam in
`cpx_toponyme_de_cours_d_eau` worden in `cleabs`-volgorde één MultiLineString.

## Records (47, allemaal `published`)

| Kind | Records | Selectie | Bronfeatures → vertices |
| --- | ---: | --- | --- |
| `river` | 8 | Garonne ("la Garonne" + "Fleuve la Garonne", het laatste getijdestuk vóór de Bec d'Ambès), Dordogne, Isle ("l'Isle"; segmenten met een ander toponiem, zoals "Bras de l'Isle", worden niet opgevraagd), Ciron; Marne, Aube, Seine, Vesle (exacte naam; segmenten met een ander toponiem, zoals "Bras de …" en kanalen, worden niet opgevraagd) | 349/1.414, 307/1.221, 548/2.478, 275/2.192; 1.049/6.044, 1.018/6.781, 1.240/6.487, 248/3.160 |
| `water-body` | 9 | `plan_d_eau`-objecten op `toponyme` én `cleabs`: Gironde-estuarium (nature "Estuaire"), Lac d'Hourtin, Lac de Carcans, Lac de Lacanau, Lac de Cazaux et Sanguinet; Lac du Der-Chantecoq, Lac d'Orient, Lac d'Auzon-Temple, Lac d'Amance | 1 object elk; estuarium 8.760 vertices, meren 446–1.425 |
| `coastline` | 1 | `limite_terre_mer` met `niveau` "Plus hautes eaux" en zonder `type_de_limite` (hoogwaterlijn; juridische limieten en laagwaterlijn uitgesloten); Atlantische kust, Bassin d'Arcachon en estuariumoevers tot de zoutgrens | 217/49.382 |
| `populated-place` | 29 | `chef_lieu_de_commune` op INSEE-code; de import controleert `nom_officiel` en `nom_du_chef_lieu` | 21 Bordeaux, 8 Champagne |

Geen gevraagde plaats is vervallen. Twee plaatsen bestaan niet meer als
gemeente onder de gevraagde naam: Margaux is de chef-lieu van de commune
nouvelle Margaux-Cantenac (INSEE 33268) met chef-lieu-naam "Margaux" en is zo
gelabeld; Cadillac heet officieel Cadillac-sur-Garonne (INSEE 33081) en draagt die
naam. Voor Pomerol en Saint-Estèphe ligt de chef-lieu bij de gehuchten Trochau
en Canteloup; het label is de gemeentenaam en de notitie vermeldt de locatie.
Het Bassin d'Arcachon heeft in BD CARTO geen `plan_d_eau`-object; het is
onderdeel van de kustlijn. De Dronne, de Leyre en de Aisne zijn niet opgenomen.

Alle 47 records zijn met de nieuwe stap `coordinate-precision` (8 decimalen)
geschreven; de 39 appellationrecords zijn opnieuw gegenereerd met dezelfde stap
(checksums gewijzigd). `npm run geography:import` is idempotent (86 ×
`unchanged`).

## Scènes

Acht scènes in `data/geography/scenes/` volgens contract §5: lagen water →
context → appellations → places; context `geo.appellation-area.bordeaux` in de
zeven Bordeaux-scènes (in `scene.bordeaux` zijn de 36 overige gepubliceerde
appellations selecteerbaar); Champagne zonder context; `intended_entities` per
de contracttabel, inclusief de held Côtes de Bordeaux; `extent.mode: fit` met
padding 0,05–0,10. Held records staan in geen laag.

**De Atlas-displaybuild weigert alle acht scènes.** De builder in
`scripts/geography/lib/display.ts` behandelt elk deel van een meerdelige feature
dat na quantisatie (1e5 stappen) of afronding op 0,1 viewBox-eenheid geen
uitgestrektheid meer heeft als fataal voor de scène ("even without
simplification … collapses '<feature>'"). BD CARTO bevat legitiem
riviersegmenten van 2–4 m (Marne: 245 van 1.049 segmenten korter dan 50 m;
Isle 95 van 548; kustlijn 54 van 217) en eilandgaten van 20–30 m in het
estuarium en de meren. Dat is generalisatie voor weergave, geen
gegevensgebrek: de canonical records zijn correct en volledig. De oplossing
hoort in de displaybuild (degenererende sub-delen laten vallen en tellen in het
simplificatieverslag; alleen falen als een hele feature verdwijnt). De scènes
zijn bewust gelaten zoals het contract ze bedoelt; `npm run content:check` is
daardoor rood totdat de build-agent de regel aanpast.

## Verificatie 2026-10-31

- `npm run geography:fetch -- --verify`: 22 resources geverifieerd;
  `--capture-raw`: 20 × `service-unchanged`.
- `npm run geography:import`: 39 appellationrecords bijgewerkt (precisiestap),
  47 oriëntatierecords aangemaakt; tweede run 86 × `unchanged`.
- `npx vitest run scripts/geography/`: 73 tests geslaagd, waaronder ruwe-respons-
  verificatie, capture en inhoudsvergelijking, lijn- en puntvalidatie en een
  end-to-end oriëntatie-import in een tijdelijke root.
- `npx tsc --noEmit` en `npx eslint` zonder meldingen voor de geografiescripts.
- `npm run content:check`: alle 86 records en 8 scènes doorstaan schema-,
  referentie-, checksum-, bbox- en oriëntatiecontroles; de Atlas-displaybuild
  faalt op de hierboven beschreven regel.
- `npx prettier --check`: alle gegenereerde en handgeschreven bestanden
  geformatteerd, behalve de 20 ruwe antwoorden onder `data/geography/raw/`, die
  byte-voor-byte gepind zijn en nooit geformatteerd mogen worden
  (`.prettierignore` moet `data/geography/raw/` opnemen).

# Aanvulling 2026-10-31 (tweede deel): reviewbevindingen verwerkt

Naar aanleiding van de review van de importlanding zijn de volgende punten
verwerkt en is de import opnieuw gedraaid.

- **Holes tegen exterieur en tegen elkaar.** De holecontrole testte alleen
  holevertices. `validateAreaGeometry` gebruikt nu dezelfde segment-sweep als de
  zelfdoorsnijdingstest voor elk paar exterieur–hole en hole–hole, en telt
  alleen echte kruisingen; raken in een vertex of langs een rand blijft
  toegestaan (de sliver-holes van Moulis-en-Médoc). Tests dekken een hole die
  een concaaf exterieur kruist terwijl al zijn vertices binnen liggen, twee
  overlappende holes zonder vertex in elkaar, en het toegestane raken. De sweep
  over het hele INAO-bestand (1.852 records, 13.761 polygonen, 3.213 holes):
  119 holes raken hun exterieurring, 0 liggen erbuiten, 0 exterieur–hole- en
  0 hole–hole-kruisingen. Voor de 39 gemapte records: 214 polygonen, 7 holes,
  2 rakend, 0 kruisingen. Twaalf niet-gemapte records van het bestand hebben
  delen zonder oppervlakte of herhaalde opeenvolgende posities; geen ervan is
  gemapt.
- **`cleabs`-volgorde.** De import eist nu dat elk vastgepind WFS-antwoord in
  strikt stijgende `cleabs`-volgorde staat en weigert anders; alle 20 antwoorden
  voldoen. De recordnotitie zegt daarom "verified cleabs order".
- **ADMIN EXPRESS-editie.** De vermelding "édition du 1er janvier 2026" was
  afgeleid uit de namespace. De bronvermelding luidt nu "IGN, ADMIN EXPRESS COG
  2026 (code officiel géographique au 1er janvier 2026), service Géoplateforme
  consulté le 30 octobre 2026". Bij controle op 31 oktober vermeldt de
  WFS-laagbeschrijving "ADMINEXPRESS COG 2026 Chef-lieu de commune ; édition
  2026-01-01", in hetzelfde sjabloon als de oudere jaargangen; een afzonderlijke
  publicatiedatum geeft de service niet. `release` en `published_at` blijven
  2026-01-01 als de door de service genoemde editiedatum. BD CARTO houdt
  2026-03-15 uit de laagbeschrijving.
- **Dataset-identificatie.** `dataset_id` is voor IGN nu de catalogusidentificatie
  die `dataset_url` oplost (`IGNF_BD-CARTO`, `IGNF_ADMIN-EXPRESS`; CSW
  GetRecordById bevestigd op 31 oktober). De interne slug staat alleen nog als
  `raw_directory`, de map onder `data/geography/raw/`.
- **Moduleopsplitsing.** `scripts/geography/import.ts` is de orchestrator; de
  onderdelen staan in `scripts/geography/lib/`. Dubbele helpers zijn verwijderd:
  `ringSignedArea` en de eigen bbox-functie wijken voor `planarSignedArea` en
  `geometryBbox` uit `lib/geometry.ts`, `isNodeError` komt uit
  `scripts/content/pipeline/files.ts`. `writeAtomically` blijft voorlopig in
  `lib/write.ts`, omdat de versie in `lib/output.ts` niet geëxporteerd is.
- **Kleinere punten.** Beide tabellen worden volledig voorbereid voordat er iets
  wordt geschreven; de recordnotities herhalen niet langer de editietekst en
  toolversies uit het manifest; `ign-orientation.yaml` heeft `reviewed_at`
  2026-10-31; notities over "Bras de …" zeggen nu dat segmenten met een ander
  toponiem niet worden opgevraagd; één licentie-URL per licentie-id
  (`https://www.data.gouv.fr/pages/legal/licences/etalab-2.0`); afronding
  levert nooit `-0`; de README vermeldt dat checksums afhangen van de
  geïnstalleerde Prettier-versie en dat een vers vastgelegd ruw bestand
  onbevestigd is tot het opnieuw is vastgepind.

Verificatie: `npm run geography:fetch -- --verify` 22 resources geverifieerd;
`npm run geography:import -- --dry-run` 39 appellationrecords ongewijzigd en
47 oriëntatierecords bijgewerkt, alleen in `dataset_id`, de ADMIN EXPRESS-
bronvermelding, `reviewed_at` en de notities (geen enkel GeoJSON-bestand
gewijzigd); daarna de echte import en een tweede run met 86 × `unchanged`;
`npm run content:check` en `npm run content:build` geslaagd met 8 scènes.

Scènewijziging na de browsercontrole (2026-10-31): in alle acht scènes is de
laagvolgorde nu context → appellations → water → places, zodat estuarium en
rivieren boven de appellationvlakken liggen (contract §5: tekenvolgorde is
laagvolgorde). In `scene.bordeaux` staan Bordeaux Supérieur en Crémant de
Bordeaux nu in de contextlaag naast Bordeaux, omdat hun vorm identiek is aan
het overkoepelende Bordeaux-gebied; ze blijven in `intended_entities`. Graves
Supérieures en Saint-Émilion Grand Cru blijven selecteerbaar. Geen record is
gewijzigd.
