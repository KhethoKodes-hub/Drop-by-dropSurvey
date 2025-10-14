// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container container-card">
      <div className="card p-4">
        <h1 className="mb-3">Drop by Drop Change — Digital Survey</h1>
        <p>Select your township:</p>
        <div className="list-group">
          <Link href="/soweto" className="list-group-item list-group-item-action">Soweto </Link>
          <Link href="/alexandra" className="list-group-item list-group-item-action">Alexandra</Link>
          <Link href="/tembisa" className="list-group-item list-group-item-action">Tembisa </Link>
        </div>
        <hr />
        <p className="small text-muted">Agents should fill the form for each household during visits.</p>
<p className="small text-muted footer-brand">© 2025 Powered by Brandscapers Africa</p>
      </div>
    </div>
    
  );
}
