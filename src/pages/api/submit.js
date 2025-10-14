// pages/api/submit.js
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses');

    // Attach server timestamp
    const payload = {
      ...req.body,
      submittedAt: new Date()
    };

    const result = await collection.insertOne(payload);

    return res.status(201).json({ insertedId: result.insertedId });
  } catch (error) {
    console.error('Error inserting to MongoDB:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
