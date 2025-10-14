// lib/mongodb.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable in .env.local or Vercel settings.');
}

let cached = global._mongo;

if (!cached) {
  cached = global._mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    cached.promise = client.connect().then((client) => {
      return {
        client,
        db: client.db() // default DB from connection string
      };
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
