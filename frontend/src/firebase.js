// src/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDokjUrPcuJyPswOppbsGIT78CCqMnSmcc",
  authDomain: "geeta-app-6d0e0.firebaseapp.com",
  projectId: "geeta-app-6d0e0",
  storageBucket: "geeta-app-6d0e0.firebasestorage.app",
  messagingSenderId: "1030429675897",
  appId: "1:1030429675897:web:3f624b5083cc9eed2e1fa8"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);
const auth = getAuth(app);

export { messaging, getToken, onMessage, auth };
