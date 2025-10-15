// pages/api/admin/summary.js
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
    await verifyToken(req); // will throw if invalid

    const { db } = await connectToDatabase();
    const collection = db.collection('surveyResponses');

    // Total responses
    const totalResponses = await collection.countDocuments();

    // Count by township
    const byTownship = await collection.aggregate([
      { $group: { _id: '$township', count: { $sum: 1 } } },
      { $project: { township: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    // Example: people count (if you store householdSize as strings like "4-5" we try some heuristics)
    // If you stored a numeric value for householdPopulation, replace this aggregation.
    const peopleEstimateCursor = await collection.aggregate([
      { $match: { householdSize: { $exists: true } } },
      {
        $group: {
          _id: '$township',
          households: { $sum: 1 },
          // just sample a naive approach: if householdSize is numeric string, sum it
          peopleCount: {
            $sum: {
              $convert: { input: "$householdSize", to: "double", onError: 0, onNull: 0 }
            }
          }
        }
      },
      { $project: { township: '$_id', households: 1, peopleCount: 1, _id: 0 } }
    ]).toArray();

    return res.json({ totalResponses, byTownship, peopleEstimate: peopleEstimateCursor });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: 'Unauthorized or error: ' + (err.message || err) });
  }
}
