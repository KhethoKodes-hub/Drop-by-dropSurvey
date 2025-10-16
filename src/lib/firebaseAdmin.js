// lib/firebaseAdmin.js
// Safe Firebase Admin initialization using base64 env var.
// Does NOT crash in dev if env var is missing — logs a warning.

import admin from 'firebase-admin';

if (!admin.apps.length) {
  const fbBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '';

  if (!fbBase64) {
    // In local dev you might use a JSON file; do not throw here to allow non-Firebase flows for public submit
    console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not set. Firebase Admin features (verifyIdToken) will fail until set.');
  } else {
    try {
      const json = JSON.parse(Buffer.from(fbBase64, 'base64').toString('utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(json),
      });
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64', err);
    }
  }
}

export default admin;
