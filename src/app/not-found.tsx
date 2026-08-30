import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Niet gevonden</p>
        <h1>Deze pagina bestaat niet.</h1>
        <div className="page-intro-copy">
          <p>De route verwijst niet naar een bekende pagina of canonical entity.</p>
          <Link className="text-link" href="/explore">Ga naar Ontdekken →</Link>
        </div>
      </div>
    </main>
  );
}
