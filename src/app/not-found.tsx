import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">Niet gevonden</p>
        <h1>Deze pagina bestaat niet.</h1>
        <div className="page-intro-copy">
          <p>We kunnen de pagina die je zoekt niet vinden.</p>
          <Link className="text-link" href="/explore">Ga naar Ontdekken →</Link>
        </div>
      </div>
    </main>
  );
}
