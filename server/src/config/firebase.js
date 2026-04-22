const admin = require("firebase-admin");
const logger = require("../utils/logger");

let firebaseApp;

const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  if (!process.env.FIREBASE_PROJECT_ID) {
    logger.warn("Firebase not configured — auth routes will be unavailable");
    return null;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    logger.info("✅ Firebase Admin initialized");
    return firebaseApp;
  } catch (err) {
    logger.error("Firebase Admin init error:", err);
    return null;
  }
};

const verifyFirebaseToken = async (idToken) => {
  const app = initFirebase();
  if (!app) throw new Error("Firebase not configured");
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { initFirebase, verifyFirebaseToken };
