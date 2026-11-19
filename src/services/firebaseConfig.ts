/**
 * Production Firebase Configuration Boundary
 *
 * When Firebase environment variables (VITE_FIREBASE_API_KEY, VITE_FIREBASE_PROJECT_ID, etc.)
 * are configured in deployment, this module exposes status and configuration checks without
 * pretending Firebase is connected when credentials are absent.
 */

export interface FirebaseEnvStatus {
  configured: boolean;
  projectId: string | null;
  authDomain: string | null;
}

export function getFirebaseEnvStatus(): FirebaseEnvStatus {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

  const configured = Boolean(apiKey && projectId && authDomain);
  return {
    configured,
    projectId: configured ? String(projectId) : null,
    authDomain: configured ? String(authDomain) : null,
  };
}
