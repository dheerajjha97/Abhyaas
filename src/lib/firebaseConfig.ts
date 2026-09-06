// Firebase Configuration Module
// Provides default credentials for Abhyaas with optional VITE_FIREBASE_* environment variable overrides.
// This ensures successful builds across Vercel, Netlify, GitHub Actions, and local dev without missing file errors.

export interface FirebaseConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  measurementId?: string;
  oAuthClientId?: string;
  recaptchaSiteKey?: string;
}

export const firebaseConfig: FirebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0391997692',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:452614748241:web:a5503b2c647a3e70a66070',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCQ8nALQNByY0sBgNnVjQ_2idlEY82zhY8',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0391997692.firebaseapp.com',
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || 'ai-studio-abhyaas-a8a9c3bd-a79a-48c8-a199-9b32f0de1029',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'gen-lang-client-0391997692.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '452614748241',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
  oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || '452614748241-ibav644kuog2rohflhhfj4v214t0r5im.apps.googleusercontent.com',
  recaptchaSiteKey: import.meta.env.VITE_FIREBASE_RECAPTCHA_SITE_KEY || '',
};

export default firebaseConfig;
