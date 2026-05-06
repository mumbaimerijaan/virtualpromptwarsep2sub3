import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore, 
  enableIndexedDbPersistence,
  Firestore
} from 'firebase/firestore';
import { getAuth, signInAnonymously, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Singleton initialization
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

export const initFirebase = () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore with long-polling optimization
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });

    // Initialize Auth
    auth = getAuth(app);
    signInAnonymously(auth).catch((error) => {
      console.error('Firebase Anonymous Auth Error:', error.code, error.message);
    });

    // Enable offline persistence
    if (db) {
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support persistence.');
        }
      });
    }

  } else {
    app = getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
  }
  
  return { app, db };
};

// Export db getter for services
export const getDb = () => {
  if (!db) {
    const initialized = initFirebase();
    return initialized.db;
  }
  return db;
};

export const getFirebaseToken = async () => {
  if (!auth) return null;
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};
