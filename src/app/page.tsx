import { BRAND } from "@/config/brand";

const lessons = [
  {
    number: "1.1",
    title: "De wijnstok als levend systeem",
    description:
      "Leer de wijnstok zien als een netwerk van bronnen, groeipunten en opslag — niet als een machine die simpelweg druiven produceert.",
    meta: "18 min · Foundation",
    active: true,
  },
  {
    number: "1.2",
    title: "Water, hydraulica en droogtestress",
    description:
      "Van bodem naar blad: hoe waterbeschikbaarheid groei, fotosynthese en rijping begrenst.",
    meta: "Gepland · Advanced",
  },
  {
    number: "1.3",
    title: "Fotosynthese, suikers en rijping",
    description:
      "Waarom rijpheid meer is dan suiker — en waarom timing alles verandert.",
    meta: "Gepland · Intermediate",
  },
];

function LogoMark() {
  return (
    <svg viewBox="0 0 44 44" aria-hidden="true" className="logo-mark">
      <path d="M22 37c-6-5-10-10-10-16 0-6 4-11 10-14 6 3 10 8 10 14 0 6-4 11-10 16Z" />
      <path d="M22 10c-4 6-4 15 0 24M17 15c3 2 7 2 10 0M16 23c4 2 8 2 12 0" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="m7 4 6 6-6 6" />
    </svg>
  );
}

function VineDiagram() {
  return (
    <svg
      viewBox="0 0 620 290"
      role="img"
      aria-labelledby="vine-title vine-description"
      className="vine-diagram"
    >
      <title id="vine-title">Bronnen en bestemmingen in de wijnstok</title>
      <desc id="vine-description">
        Bladeren maken suikers die verdeeld worden tussen groei, druiven en
        opslag.
      </desc>
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="4"
          orient="auto"
        >
          <path d="M0 0 8 4 0 8Z" fill="var(--diagram-line)" />
        </marker>
      </defs>
      <path
        className="diagram-line"
        d="M310 72v36M310 145v27M300 188l-145 40M320 188l145 40M310 192v60"
      />
      <g className="diagram-node diagram-node-source">
        <rect x="235" y="20" width="150" height="52" rx="26" />
        <text x="310" y="52">
          BLADEREN
        </text>
      </g>
      <text className="diagram-label" x="330" y="96">
        fotosynthese
      </text>
      <g className="diagram-node diagram-node-core">
        <rect x="244" y="108" width="132" height="48" rx="24" />
        <text x="310" y="138">
          SUIKERS
        </text>
      </g>
      <g className="diagram-node">
        <rect x="70" y="214" width="170" height="52" rx="14" />
        <text x="155" y="246">
          NIEUWE GROEI
        </text>
      </g>
      <g className="diagram-node">
        <rect x="380" y="214" width="170" height="52" rx="14" />
        <text x="465" y="246">
          DRUIVEN
        </text>
      </g>
      <g className="diagram-node">
        <rect x="244" y="238" width="132" height="42" rx="14" />
        <text x="310" y="264">
          OPSLAG
        </text>
      </g>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#lesson">
        Ga naar de les
      </a>
      <header className="site-header">
        <a href="#top" className="brand" aria-label={`${BRAND.name}, naar boven`}>
          <LogoMark />
          <span>{BRAND.name}</span>
        </a>
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          <a className="is-active" href="#learn">
            Leren
          </a>
          <a href="#explore">Ontdekken</a>
          <a href="#atlas">Atlas</a>
        </nav>
        <div className="header-actions">
          <button className="icon-button" aria-label="Zoeken">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle cx="9" cy="9" r="5.5" />
              <path d="m13.2 13.2 4 4" />
            </svg>
          </button>
          <button className="profile-button" aria-label="Profiel openen">
            RW
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero" id="learn">
          <div className="hero-copy">
            <p className="eyebrow">Jouw leerpad</p>
            <h1>{BRAND.tagline.nl}</h1>
            <p className="hero-intro">
              Geen verzameling losse feiten, maar een rustig opgebouwd
              kennisnetwerk dat laat zien hoe keuzes in wijngaard en kelder
              uiteindelijk in het glas belanden.
            </p>
            <a className="primary-button" href="#lesson">
              Ga verder met les 1.1 <ArrowIcon />
            </a>
          </div>
          <aside className="progress-card" aria-label="Voortgang Module 1">
            <div className="progress-card-top">
              <span>Module 1</span>
              <span>1 van 8</span>
            </div>
            <h2>De wijnstok begrijpen</h2>
            <p>Viticultuur voorbij de basis: van fysiologie naar wijnstijl.</p>
            <div className="progress-track" aria-label="13 procent voltooid">
              <span />
            </div>
            <div className="progress-caption">
              <span>Voortgang</span>
              <strong>13%</strong>
            </div>
          </aside>
        </section>

        <section className="lesson-list" aria-labelledby="module-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Module 1</p>
              <h2 id="module-title">Begin bij het levende systeem</h2>
            </div>
            <p>
              De lessen bouwen op elkaar voort. Je hoeft niet alles in één keer
              te onthouden.
            </p>
          </div>
          <div className="lesson-grid">
            {lessons.map((lesson) => (
              <article
                className={`lesson-card${lesson.active ? " lesson-card-active" : ""}`}
                key={lesson.number}
              >
                <div className="lesson-number">{lesson.number}</div>
                <div className="lesson-card-copy">
                  <div className="lesson-meta">{lesson.meta}</div>
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  {lesson.active ? (
                    <a href="#lesson">
                      Nu lezen <ArrowIcon />
                    </a>
                  ) : (
                    <span className="lesson-status">Binnenkort</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          className="lesson-reader"
          id="lesson"
          aria-labelledby="lesson-title"
        >
          <aside className="lesson-rail">
            <p className="eyebrow">Les 1.1</p>
            <nav aria-label="Inhoud van de les">
              <a className="is-active" href="#lesson-intro">
                Het grote idee
              </a>
              <a href="#source-sink">Bronnen en bestemmingen</a>
              <a href="#simplification">De nuttige nuance</a>
              <a href="#in-the-glass">Waarom in het glas?</a>
            </nav>
            <div className="depth-note">
              <span>Informatiediepte</span>
              <strong>Foundation</strong>
              <p>Essentieel om de volgende lessen goed te begrijpen.</p>
            </div>
          </aside>
          <article className="lesson-content">
            <header className="lesson-header" id="lesson-intro">
              <div className="lesson-kicker">
                <span>18 min lezen</span>
                <span>Viticultuur</span>
              </div>
              <h2 id="lesson-title">De wijnstok als levend systeem</h2>
              <p className="lesson-lead">
                Een wijnstok reageert voortdurend op licht, water, temperatuur
                en de vraag van groeiende delen. Wie wijnbouw wil begrijpen,
                moet daarom eerst leren kijken naar verdeling en balans.
              </p>
            </header>
            <section className="learning-goals" aria-labelledby="goals-title">
              <div className="callout-icon" aria-hidden="true">
                ◎
              </div>
              <div>
                <h3 id="goals-title">Na deze les kun je</h3>
                <ul>
                  <li>
                    uitleggen waarom de wijnstok geen verzameling losse
                    onderdelen is;
                  </li>
                  <li>bronnen en bestemmingen van suikers herkennen;</li>
                  <li>
                    beredeneren waarom “minder groei” niet automatisch “betere
                    wijn” betekent.
                  </li>
                </ul>
              </div>
            </section>
            <section className="prose-section" id="source-sink">
              <p className="section-marker">01 — Het kernidee</p>
              <h3>Energie wordt gemaakt, verdeeld en opgeslagen</h3>
              <p>
                Bladeren zetten lichtenergie om in koolhydraten. Die voorraad is
                niet exclusief voor de druif: jonge scheuten, wortels, herstel
                en reserves vragen allemaal om dezelfde middelen. De verhouding
                tussen deze vragen verandert tijdens het seizoen.
              </p>
              <figure className="diagram-card">
                <VineDiagram />
                <figcaption>
                  Een bewust vereenvoudigd model. In werkelijkheid verandert de
                  richting en sterkte van deze stromen voortdurend.
                </figcaption>
              </figure>
            </section>
            <section className="callout callout-core">
              <div className="callout-label">
                <span aria-hidden="true">◉</span> Kernidee
              </div>
              <p>
                Wijnbouw draait niet om één knop voor “kwaliteit”, maar om het
                begeleiden van een levend systeem met concurrerende behoeften.
              </p>
            </section>
            <section className="prose-section" id="simplification">
              <p className="section-marker">02 — De nuttige nuance</p>
              <h3>Balans is geen vast recept</h3>
              <p>
                Een compacte wijnstok kan onder bepaalde omstandigheden gunstig
                zijn, maar dezelfde ingreep werkt niet overal hetzelfde.
                Klimaat, bodemwater, ras, onderstam en moment in het seizoen
                veranderen de uitkomst. Goede wijnbouw begint daarom met een
                mechanisme begrijpen, niet met een slogan onthouden.
              </p>
              <div className="callout callout-warning">
                <div className="callout-label">
                  <span aria-hidden="true">△</span> Veelgehoorde simplificatie
                </div>
                <p>“Een worstelende wijnstok maakt altijd betere wijn.”</p>
                <p className="callout-detail">
                  Te weinig beschikbaar water kan fotosynthese en rijping juist
                  afremmen. De volgende les onderzoekt waar nuttige beperking
                  overgaat in schadelijke stress.
                </p>
              </div>
            </section>
            <section className="glass-section" id="in-the-glass">
              <div
                className="glass-score"
                aria-label="Relevantie voor de wijn: vier van vijf"
              >
                <span>Relevantie voor de wijn</span>
                <strong>
                  ★★★★<i>★</i>
                </strong>
              </div>
              <div>
                <p className="section-marker">In het glas</p>
                <h3>Waarom doet dit ertoe?</h3>
                <p>
                  De verdeling van energie beïnvloedt groei, rijping en
                  reserves. Daarmee helpt dit model verklaren waarom canopy
                  management, opbrengst en waterbeschikbaarheid gevolgen kunnen
                  hebben voor rijpheid, frisheid en concentratie — zonder dat
                  één factor de wijn op zichzelf bepaalt.
                </p>
              </div>
            </section>
          </article>
        </section>

        <section className="closing" id="explore">
          <p className="eyebrow">Ontdekken komt later</p>
          <h2>Eerst één leerervaring goed.</h2>
          <p>
            Deze eerste vertical slice bewijst de rustige leeservaring en het
            stylesysteem. Atlas, zoeken en vergelijken volgen pas wanneer de
            onderliggende kennis daarvoor klaar is.
          </p>
        </section>
        <div id="atlas" aria-hidden="true" />
      </main>
      <footer>
        <a href="#top" className="brand">
          <LogoMark />
          <span>{BRAND.name}</span>
        </a>
        <p>{BRAND.tagline.nl}</p>
      </footer>
    </div>
  );
}
