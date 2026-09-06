"use client";

/**
 * Firebase client SDK setup — browser only.
 *
 * All config comes from NEXT_PUBLIC_* env vars (see .env.local.example).
 * Until real values are filled in, this initializes with placeholder config
 * so the app builds and renders; anything that actually talks to Firebase
 * (sign-in, Firestore reads/writes) will fail until a real project is wired
 * up. See README.md for the exact setup steps.
 */

import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import {
  type AppCheck,
  ReCaptchaV3Provider,
  initializeAppCheck,
} from "firebase/app-check";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

function createApp(): FirebaseApp {
  if (getApps().length) return getApps()[0]!;
  return initializeApp(
    firebaseConfigured
      ? firebaseConfig
      : {
          apiKey: "demo-api-key",
          authDomain: "demo.firebaseapp.com",
          projectId: "demo-project",
          storageBucket: "demo-project.appspot.com",
          messagingSenderId: "0",
          appId: "demo-app-id",
        },
  );
}

export const app = createApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

let appCheck: AppCheck | null = null;

/**
 * App Check must be initialized client-side, after the recaptcha site key
 * is available, and only in the browser (never during SSR/build).
 * Call this once from a top-level client component (see auth-context.tsx).
 */
export function ensureAppCheck() {
  if (typeof window === "undefined") return null;
  if (appCheck) return appCheck;
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_V3_SITE_KEY;
  if (!siteKey || !firebaseConfigured) return null;
  try {
    appCheck = initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch {
    // App Check can only be initialized once; ignore re-init in dev/HMR.
  }
  return appCheck;
}
