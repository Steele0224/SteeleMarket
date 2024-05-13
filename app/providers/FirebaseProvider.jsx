import { initializeApp } from "firebase/app"
import { signInWithCustomToken, getAuth } from "firebase/auth"
import { initializeFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { useContext } from "react"
import { useEffect } from "react"
import { createContext, useState } from "react"

const FirebaseContext = createContext(null)

export function FirebaseProvider({ children, firebase }) {
  const [firebaseDb, setFirebaseDb] = useState(null)
  const [firebaseStorage, setFirebaseStorage] = useState(null)

  useEffect(() => {
    if (!firebase) {
      return
    }

    const initFirebaseDb = async () => {
      const app = initializeApp(firebase.options)
      const auth = getAuth(app)
      const storage = getStorage(app)

      if (!auth.currentUser) {
        try {
          await signInWithCustomToken(auth, firebase.userToken)
        } catch (error) {
          console.error("Failed to authenticate user for REAL firestore", error)
        }

        if (!firebaseStorage) {
          setFirebaseStorage(storage)
        }

        if (!firebaseDb) {
          const db = initializeFirestore(app, {
            experimentalAutoDetectLongPolling: true,
            ignoreUndefinedProperties: true
          })
          setFirebaseDb(db)
        }
      }
    }

    initFirebaseDb().catch(error =>
      console.error("Failed to initialize firebase for REAL firestore", error)
    )
  }, [firebase, firebaseDb, firebaseStorage])

  return (
    <FirebaseContext.Provider value={{ firebaseDb, firebaseStorage }}>
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebase() {
  const context = useContext(FirebaseContext)
  if (context === undefined) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
