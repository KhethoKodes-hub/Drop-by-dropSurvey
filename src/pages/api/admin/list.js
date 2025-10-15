// pages/api/admin/list.js
import admin from '../../../lib/firebaseAdmin';
import { connectToDatabase } from '../../../lib/mongodb';

async function verifyToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) throw new Error('No auth token');
  const idToken = auth.split('Bearer ')[1];
  const decoded = await admin.auth().verifyIdToken(idToken);
  return decoded;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    await verifyToken(req);

    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses');

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.township) filter.township = req.query.township;

    const total = await collection.countDocuments(filter);
    const docs = await collection.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit).toArray();

    return res.json({ total, page, limit, docs });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized or error' + (err.message ? ': ' + err.message : '') });
  }
}
