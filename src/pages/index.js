// pages/index.js
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container container-card">
      <div className="card p-4">
        <h1 className="mb-3">Drop by Drop Change Summit — Field Survey</h1>
        <p>Select the township survey:</p>
        <div className="list-group">
          <Link href="/soweto" className="list-group-item list-group-item-action">Soweto Survey</Link>
          <Link href="/alexandra" className="list-group-item list-group-item-action">Alexandra Survey</Link>
          <Link href="/tembisa" className="list-group-item list-group-item-action">Tembisa Survey</Link>
        </div>
        <hr />
        <p className="small text-muted">Agents should fill the form for each household during visits.</p>
      </div>
    </div>
  );
}
