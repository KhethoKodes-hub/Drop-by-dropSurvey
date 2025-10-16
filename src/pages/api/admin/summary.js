// src/pages/api/admin/summary.js
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
    await verifyToken(req);

    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses');

    // total responses
    const totalResponses = await collection.countDocuments();

    // group by township
    const byTownship = await collection.aggregate([
      { $group: { _id: '$township', count: { $sum: 1 } } },
      { $project: { township: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    return res.json({ totalResponses, byTownship });
  } catch (err) {
    console.error('🔥 /api/admin/summary error:', err);
    return res.status(500).json({ message: err.message || 'Server error' });
  }
}
