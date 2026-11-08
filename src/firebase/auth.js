
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";

import { auth } from "./firebase";

// Register mahasiswa
export function registerUser(email, password) {
  return createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
}

// Login mahasiswa
export function loginUser(email, password) {
  return signInWithEmailAndPassword(
    auth,
    email,
    password
  );
}

// Logout mahasiswa
export function logoutUser() {
  return signOut(auth);
}

// Memantau status login
export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
