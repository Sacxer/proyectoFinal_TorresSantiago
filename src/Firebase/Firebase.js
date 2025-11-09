// Import the functions you need from the SDKs you need
// Firebase initialization and helpers for Auth + Firestore
import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCjuGN7832VVqBpsxWXbsVhaz8MR-uukiA",
  authDomain: "elpinguinodromo-5d5bd.firebaseapp.com",
  projectId: "elpinguinodromo-5d5bd",
  storageBucket: "elpinguinodromo-5d5bd.firebasestorage.app",
  messagingSenderId: "1035738193883",
  appId: "1:1035738193883:web:cbe6de2dfa0d594cea11fe"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)
const googleProvider = new GoogleAuthProvider()

// Helper: create user profile in Firestore
async function createUserProfile(uid, { name, email, role = 'Reportero' } = {}) {
  if (!uid) return
  const ref = doc(db, 'users', uid)
  await setDoc(ref, { name: name || null, email: email || null, role }, { merge: true })
}

// Helper: get user role
async function getUserRole(uid) {
  if (!uid) return null
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data()
  return data.role || null
}

// Expose commonly used auth helpers
export { app, auth, db, storage, googleProvider, createUserProfile, getUserRole, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged }

export default app