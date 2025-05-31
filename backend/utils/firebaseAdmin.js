// backend/utils/firebaseAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("../config/new.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
