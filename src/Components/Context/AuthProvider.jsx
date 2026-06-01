import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../../logic/firebase'
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for changes on auth state (logged in, signed out, etc.)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const loggedUser = result.user

      // Sincronizar usuario con Firestore
      const userRef = doc(db, 'users', loggedUser.uid)
      const userSnap = await getDoc(userRef)

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: loggedUser.email,
          name: loggedUser.displayName,
          created_at: serverTimestamp(),
          total_streak: 0,
          max_streak: 0,
          last_session: null,
          book_ids: [],
          habit_config: null
        })
      }
    } catch (error) {
      console.error('Error logging in with Firebase Google SSO:', error.message)
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error logging out:', error.message)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut: logOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
