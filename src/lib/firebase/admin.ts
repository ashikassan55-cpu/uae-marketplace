import "server-only";

/**
 * Firebase Admin SDK setup — server only (Route Handlers, Server Actions,
 * Cloud Functions). Never import this from a "use client" file.
 *
 * Auth: in production, set FIREBASE_SERVICE_ACCOUNT_KEY to the full JSON of
 * a service account key (as a single-line string) in your host's env vars.
 * Locally, `gcloud auth application-default login` or the Firebase emulator
 * also work via applicationDefault().
 */

import { cert, getApps, initializeApp, applicationDefault, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function createAdminApp(): App | null {
  if (getApps().length) return getApps()[0]!;

  const key = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (key) {
    try {
      const serviceAccount = JSON.parse(key);
      return initializeApp({ credential: cert(serviceAccount) });
    } catch {
      console.error(
        "FIREBASE_SERVICE_ACCOUNT_KEY is set but is not valid JSON — admin SDK not initialized.",
      );
      return null;
    }
  }

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_CONFIG) {
    return initializeApp({ credential: applicationDefault() });
  }

  return null;
}

const adminApp = createAdminApp();

export const adminAuth = adminApp ? getAuth(adminApp) : null;
export const adminDb = adminApp ? getFirestore(adminApp) : null;
export const adminConfigured = Boolean(adminApp);
