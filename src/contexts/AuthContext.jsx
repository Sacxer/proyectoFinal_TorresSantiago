import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth, db, googleProvider, createUserProfile, getUserRole, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut, onAuthStateChanged } from '../Firebase/Firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Signup with email/password and create profile in Firestore
  async function signup(email, password, name, role = 'Reportero') {
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    const user = cred.user
    // create profile doc
    await createUserProfile(user.uid, { name, email, role })
    setUserRole(role)
    return user
  }

  async function login(email, password) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    // Ensure user profile exists in Firestore, default role Reportero
    const ref = doc(db, 'users', user.uid)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      await createUserProfile(user.uid, { name: user.displayName, email: user.email, role: 'Reportero' })
      setUserRole('Reportero')
    }
    return user
  }

  function logout() {
    return signOut(auth)
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const role = await getUserRole(user.uid)
        setUserRole(role)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    signInWithGoogle,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
