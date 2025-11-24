// Firebase client initialization for Auth and Firestore
// Expects Vite env vars prefixed with VITE_*
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let app;
try {
  // Guard against missing config; only initialize when apiKey exists
  if (firebaseConfig.apiKey) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
} catch (e) {
  console.error('Firebase init error:', e);
}

export const auth = app ? getAuth(app) : undefined;
export const db = app ? getFirestore(app) : undefined;