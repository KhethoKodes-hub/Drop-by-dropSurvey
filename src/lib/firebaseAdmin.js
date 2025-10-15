// lib/firebaseAdmin.js
import admin from 'firebase-admin';

const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  throw new Error('Please set FIREBASE_SERVICE_ACCOUNT_BASE64 env var.');
}

const serviceAccountJSON = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountJSON)
  });
}

export default admin;
