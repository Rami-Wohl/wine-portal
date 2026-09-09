# Volledige producentenpresentatiemigratie — 2026-09-09

Review-ID: `QCR-2026-09-09-02`

## Reikwijdte en methode

Deze migratie sluit de vervolgacties `MNT-022` en `MNT-024` uit de
producentenarchitectuur-review. Alle 129 bestaande producerrecords zijn
gecontroleerd op status, wijnbouwlocatie, classificatierelatie, aanwezige
canonical content en zelfstandig leerdoel. De operatie verandert geen
wijnfeiten, verwijdert geen proza en activeert geen lege profielen.

De indeling volgt één vaste beslisvolgorde:

1. `monograph` alleen bij een zelfstandig pedagogisch verhaal dat de
   eigenaarpagina niet goed kan dragen;
2. `collection-profile` voor een belangrijke vergelijkingsnaam die binnen een
   appellation- of classificatiecohort betekenis krijgt; en
3. `register-entry` voor volledige, controleerbare classificatiedekking zonder
   kunstmatige mini-biografie.

Rang, prijs en reputatie zijn nooit op zichzelf beslissend. De uitkomst is een
presentatiebesluit, geen nieuwe kwaliteitsclassificatie.

## Uitkomst

| Cohort | Records | Monografie | Collectieprofiel | Registervermelding | Canonical eigenaar van embedded records |
| --- | ---: | ---: | ---: | ---: | --- |
| Pauillac | 18 | 3 | 5 | 10 | Pauillac voor profielen; Bordeaux 1855 voor register |
| Pomerol | 9 | 1 | 8 | 0 | Pomerol |
| Saint-Émilion Grand Cru | 88 | 6 | 11 | 71 | Saint-Émilionclassificatie |
| Sauternes | 4 | 1 | 3 | 0 | Sauternes |
| Barsac | 10 | 0 | 2 | 8 | Barsac voor profielen; Bordeaux 1855 voor register |
| **Totaal** | **129** | **11** | **29** | **89** | — |

De elf monografieën zijn Château Angélus, Château Ausone, Château Canon, Château
Cheval Blanc, Château d'Yquem, Château Figeac, Château Lafite Rothschild, Château
Latour, Château Mouton Rothschild, Château Pavie en Pétrus. De eerste tien
behouden hun bestaande actieve, onderzochte content. Pétrus blijft draft totdat
zijn eigen authoringcyclus volledig is doorlopen.

Binnen Pauillac zijn Pichon Baron, Pichon Longueville Comtesse de Lalande,
Grand-Puy-Lacoste, Lynch-Bages en Pontet-Canet als vergelijkende
appellationprofielen gepland. Binnen Sauternes zijn dat Guiraud, Rieussec en
Suduiraut; binnen Barsac Climens en Coutet. De elf niet-zelfstandige
Premier Grand Cru Classé-referenties van Saint-Émilion krijgen een rijker
collectieprofiel op de classificatiepagina. De overige geclassificeerde records
worden registervermelding op hun formele classificatie-eigenaar.

## Technische en procedurele afsluiting

- ieder producerrecord heeft nu een expliciet `presentation`-veld;
- alle twaalf contentplannen gebruiken schema v2;
- iedere producerdependency in een contentplan herhaalt exact de canonical
  publicatievorm;
- schema v1 en de impliciete monograph-terugval zijn verwijderd;
- de generator weigert een producer zonder expliciete keuze;
- embedded records hebben een bestaande canonical ownerrelatie en unieke anchor;
- draftrecords blijven via hun reviewroute controleerbaar, maar beloven geen
  zelfstandige publieke pagina;
- statusrapportage bevat geen legacycategorie meer.

## Controle en beperkingen

De migratie is structureel volledig: er zijn geen onbesliste producerrecords of
oude contentplannen meer. Embedded profielen blijven draft totdat hun
ownerblocks in Nederlands en Engels inhoudelijk zijn onderzocht, geschreven en
gereviewd. Dat is regulier contentauthoringwerk, geen resterende migratiestap.
Activatie blijft technisch geblokkeerd zolang owner, anchors of lokalisaties
ontbreken.

## Vervolg

`MNT-023` blijft de eerstvolgende inhoudelijke pilot: de acht Pomerolprofielen
daadwerkelijk op de Pomerolpagina schrijven en de volledige gebruikerservaring
in browser testen.
