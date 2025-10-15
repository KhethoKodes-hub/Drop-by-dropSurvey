// pages/api/admin/export.js
import admin from '../../../lib/firebaseAdmin';
import { connectToDatabase } from '../../../lib/mongodb';

async function verifyToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) throw new Error('No auth token');
  const idToken = auth.split('Bearer ')[1];
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded;
}

function toCSV(rows) {
  if (!rows || !rows.length) return '';
  const keys = Object.keys(rows[0]);
  const header = keys.join(',');
  const lines = rows.map(r => keys.map(k => {
    let v = r[k] ?? '';
    if (typeof v === 'object') v = JSON.stringify(v);
    // escape quotes
    v = String(v).replace(/"/g, '""');
    if (v.includes(',') || v.includes('"') || v.includes('\n')) return `"${v}"`;
    return v;
  }).join(','));
  return [header, ...lines].join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await verifyToken(req);

    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses');

    const filter = {};
    if (req.query.township) filter.township = req.query.township;

    const docs = await collection.find(filter).sort({ submittedAt: -1 }).toArray();

    // sanitize fields to plain JS
    const rows = docs.map(d => {
      const { _id, ...rest } = d;
      return { id: String(_id), ...rest };
    });

    const csv = toCSV(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="survey_export_${req.query.township||'all'}_${Date.now()}.csv"`);
    return res.status(200).send(csv);
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized or error' });
  }
}
