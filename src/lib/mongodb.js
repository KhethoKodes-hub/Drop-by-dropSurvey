// lib/mongodb.js
// A single helper used by all API routes: returns { client, db }
// Works with both development and production (Vercel).

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('MONGODB_URI is not defined in environment');
}

let cachedClient = global._mongoClient || null;
let cachedDb = global._mongoDb || null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db('dropbydrop'); // <-- confirm your DB name (change if different)

  // cache on global for lambda reuse
  global._mongoClient = client;
  global._mongoDb = db;

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export default connectToDatabase;
