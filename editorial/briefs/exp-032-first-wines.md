# EXP-032 — Port, Sherry en Champagne

Datum: 2026-10-13. Uitvoering van de eerste batch uit de actuele productroadmap,
na de opdracht om volgens dat plan verder te gaan. Dit is de redactionele
afbakening vóór scaffolding en authoring; geen nieuw curriculumvoorstel.

## Identiteit en afbakening

| Package | Canonical eigenaar | Niet de eigenaar van |
| --- | --- | --- |
| `appellation.port` | De beschermde wijnnaam Porto/Port, met oorsprong, productie en betekenis van de belangrijkste rijpingscategorieën | Alle Dourowijnen, alle zoete of versterkte wijn, individuele merken |
| `appellation.sherry` | Jerez-Xérès-Sherry, met de droge en zoete wijntypen en hun huidige productievoorwaarden | Alle wijn uit de streek Jerez, de afzonderlijke Manzanilla-DOP, de algemene techniek van versterking |
| `appellation.champagne` | De beschermde mousserende wijn Champagne, van herkomst tot fles en etiket | Het volledige geografische gebied Champagne, alle traditionele-methodewijn, producentenranglijsten |

Gebruik `appellation-overview`, bestaande routetypen en gedeelde NL/EN-data.
Geen nieuw `wine_style`-model. De hoofdvragen zijn: waar komt deze wijn vandaan,
waardoor verschillen de flessen, wat zegt het etiket en welke bestaande techniek
verklaart dat verschil? Voorkennis: wijn ontstaat door vergisting; de samenvatting
en foundationblokken leggen noodzakelijke nieuwe termen direct uit.

## Dekkingsplan vóór prose

Alle drie krijgen oriëntatie, een korte ontwikkelingsgeschiedenis, landschap,
hoofddruiven, wijnmaken, kernregels, producentenrollen, stijl, etiket en
vervolglinks. Diepte wordt per vraag gekozen, niet op grond van het aantal feiten.

| Onderwerp | Foundationvraag | Verdieping en begrenzing |
| --- | --- | --- |
| Port | Hoe levert een gistingsstop zoetheid op, en wat onderscheidt ruby, tawny, wit en rosé? | Vintage tegenover LBV en colheita; leeftijdsaanduiding is geen oogstjaar. Geen complete wettelijke categorielijst of verkoopadvies. |
| Sherry | Hoe verschillen flor, oxidatieve rijping, droge en zoete typen? | Solera tegenover añada; huidige mogelijkheid van onversterkte droge wijn. Manzanilla apart houden; geen algemene zoetheid uit kleur afleiden. |
| Champagne | Hoe hangen stille basiswijn, assemblage, tweede flesgisting en rijping samen? | Herkomst van druiven tegenover producentenrol; vintage, blanc de blancs/noirs en dosage beantwoorden verschillende vragen. Geen appellation gelijkstellen aan productiemethode. |

De twaalf archetypedimensies worden in ieder content-plan afzonderlijk verwerkt.
Een actuele juridische ontwikkeling krijgt alleen tekst bij een definitieve bron;
een modernisering zonder onderbouwde claim mag gemotiveerd buiten scope blijven.
De pages zijn introducties tot deze appellations, geen complete regionale
monografieën of technisch naslagwerk voor producenten.

## Dependencies en ownership

Scaffold vóór de overviews de ontbrekende regionale ouders `region.douro`,
`region.jerez` en `region.champagne`, plus de herbruikbare hoofddruiven
`grape.touriga-franca`, `grape.tempranillo` (Tinta Roriz als alias),
`grape.palomino`, `grape.pedro-ximenez`, `grape.muscat-of-alexandria`,
`grape.pinot-noir` en `grape.meunier`.
Controleer bestaande IDs vóór aanmaak. `grape.touriga-nacional` en
`grape.chardonnay` bestaan al. Regionale ouders en nieuwe druiven blijven draft;
de appellationtekst moet begrijpelijk zijn zonder die toekomstige monografieën.
Geen lege draftpagina's als leesadvies presenteren. Grapes krijgen structurele
relaties; de lopende tekst legt hun lokale rol zelf uit.

Aanvulling bij de slotreview op 2026-10-13: Moscatel de Alejandría is als
`grape.muscat-of-alexandria` aan de draftdependencies en belangrijke Sherrydruiven
toegevoegd; de bestaande Muscat Blanc à Petits Grains is een ander ras.

De bestaande family- en procespagina's blijven eigenaar van algemene principes.
Appellationpagina's passen die toe en verwijzen terug. Algemene flor/solerauitleg
blijft voor nu bij `concept.fortified-wines`; Sherry verklaart de lokale wijntypen.
Named producenten en producten zijn voor deze introductie niet noodzakelijk.

## Claims, bronnen en beeld

- Port: IVDP voor identiteit, regio, geschiedenis, druiven, vinificatie en
  categorieën. Promotionele kwaliteitsrangordes niet als objectief oordeel overnemen.
- Sherry: actuele geconsolideerde Junta-specificatie en definitieve EU-goedkeuring
  voor regels; Consejo voor uitleg, geschiedenis en etiketten. De nieuwsbron van
  2022 beschreef gedeeltelijk nog voorstellen en is dus geen zelfstandig bewijs
  van inwerkingtreding. Verouderde suikergrenzen op uitlegpagina's niet herhalen.
- Champagne: Comité voor herkomst, druiven, productie en etiket; vastgestelde
  regels onderscheiden van INAO-wijzigingsvoorstellen. Geen volledig aantal
  toegestane druiven publiceren uit tegenstrijdige of verouderde infographics.
- Documentaire foto's maken kelderhandelingen voorstelbaar: echte Portvaten,
  Sherrykelder en bestaand Champagne-remuagerek. Controleer herkomst, licentie,
  credit en afmetingen. Caption beperkt zich tot het zichtbare, geen afgeleide
  exacte leeftijd, kwaliteit of volledige productiemethode. Geen verzonnen kaart.
  Bij ontbrekende bruikbare rechten mag beeld gemotiveerd achterwege blijven.

## Publicatiegate

Gelijkwaardige NL/EN-claims, blocks en bronnen; alle scopevragen beantwoord;
primary bronreview; relaties en familie-/proceslinks; mediacredits; geen essentiële
uitleg verscholen achter een draftlink. Content-, link- en relatiechecks, volledige
projectcheck, productiebouw en browsercontrole van beide talen, diepte, kleine en
grote schermen. Publicatiereview legt bevindingen vast. EXP-032 blijft open voor
de afzonderlijk geordende catalogusbatches in de inventaris.
