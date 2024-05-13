
import { doc, setDoc } from "firebase/firestore"

import {

  USERS_COLLECTION
} from "./constants"
import { getServerFirebase } from "./firebase.server"



export async function createUserWithUserData(user) {
  const { firebaseDb } = getServerFirebase()
  const userDoc = doc(firebaseDb, `/${USERS_COLLECTION}/${user.id}`)

  await setDoc(userDoc, user)
}
