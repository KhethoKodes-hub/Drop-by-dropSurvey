// src/pages/api/admin/list.js
import admin from '../../../lib/firebaseAdmin';
import connectToDatabase from '../../../lib/mongodb';

async function verifyToken(req) {
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) throw new Error('No auth token in Authorization header');
  const idToken = auth.split('Bearer ')[1];
  if (!admin || !admin.auth) throw new Error('Firebase Admin not initialized');
  return admin.auth().verifyIdToken(idToken);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' });

  try {
    // verify token - will throw if missing/invalid
    await verifyToken(req);

    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses');

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.township) filter.township = req.query.township;

    // optional date filtering
    if (req.query.startDate || req.query.endDate) {
      filter.submittedAt = {};
      if (req.query.startDate) filter.submittedAt.$gte = new Date(req.query.startDate);
      if (req.query.endDate) filter.submittedAt.$lte = new Date(req.query.endDate);
    }

    const total = await collection.countDocuments(filter);
    const docs = await collection.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit).toArray();

    return res.json({ total, page, limit, docs });
  } catch (err) {
    console.error('🔥 /api/admin/list error:', err);
    // if auth error, send 401 else 500
    const status = (err.message && err.message.toLowerCase().includes('token')) ? 401 : 500;
    return res.status(status).json({ message: err.message || 'Unauthorized or server error' });
  }
}
