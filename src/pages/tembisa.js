// pages/tembisa.js
import SurveyForm from '../components/SurveyForm';
import Link from 'next/link';

export default function Tembisa() {
  return (
    <div className="container container-card">
      <div className="mb-3">
<Link href="/" className="text-decoration-none">← Back</Link>
      </div>
      <SurveyForm township="Tembisa" />
    </div>
  );
}
