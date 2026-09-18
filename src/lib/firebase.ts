import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  getFirestore,
  Firestore,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
} from 'firebase/firestore';
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
  Messaging,
} from 'firebase/messaging';
import firebaseConfig from './firebaseConfig';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Suppress routine offline / retry connection logs in sandbox/iframe environments
setLogLevel('silent');

// Initialize Firestore with auto-detected long-polling and local multi-tab cache for seamless offline operation
let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || '(default)'
  );
} catch {
  try {
    dbInstance = initializeFirestore(
      app,
      {
        experimentalAutoDetectLongPolling: true,
      },
      firebaseConfig.firestoreDatabaseId || '(default)'
    );
  } catch {
    dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
  }
}

export const db = dbInstance;

// Messaging initialization helper (safe for browser environments)
let messagingInstance: Messaging | null = null;

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  if (typeof window === 'undefined') return null;
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }
  if (!messagingInstance) {
    try {
      messagingInstance = getMessaging(app);
    } catch {
      return null;
    }
  }
  return messagingInstance;
};

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  getToken,
  onMessage,
};
export type { User };
export { firebaseConfig };
