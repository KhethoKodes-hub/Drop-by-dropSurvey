// src/pages/api/submit.js
import connectToDatabase from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses'); // ensure collection name matches your DB

    const payload = {
      ...req.body,
      submittedAt: new Date()
    };

    const result = await collection.insertOne(payload);

    return res.status(201).json({ ok: true, insertedId: result.insertedId });
  } catch (error) {
    console.error('🔥 /api/submit error:', error);
    // return full error message for debugging (temporary). After fix, change to a generic message.
    return res.status(500).json({ message: 'Internal server error', error: String(error.message || error) });
  }
}
