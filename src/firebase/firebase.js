
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const env = (typeof import.meta !== "undefined" && import.meta?.env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCI9TOziJaYADIhigsepVEhEOnuB05TpM4",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "academic-planning-system-5da68.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "academic-planning-system-5da68",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "academic-planning-system-5da68.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1031667585837",
  appId: env.VITE_FIREBASE_APP_ID || "1:1031667585837:web:72cdfbda72860ad22db9a4",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-27T3CNZ17F"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
