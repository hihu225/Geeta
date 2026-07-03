// backend/utils/firebaseAdmin.js
const admin = require("firebase-admin");

let initialized = false;

try {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) {
    console.warn(
      "[firebaseAdmin] GOOGLE_APPLICATION_CREDENTIALS_JSON not set — push notifications disabled."
    );
  } else {
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    initialized = true;
    console.log("[firebaseAdmin] Initialized");
  }
} catch (err) {
  console.error("[firebaseAdmin] Failed to initialize:", err.message);
}

// Proxy so callers can still `admin.messaging()` without crashing when disabled
const noopMessaging = {
  send: async () => {
    throw new Error("Firebase Admin is not initialized (missing credentials)");
  },
};

module.exports = new Proxy(admin, {
  get(target, prop) {
    if (prop === "messaging" && !initialized) {
      return () => noopMessaging;
    }
    return target[prop];
  },
});
