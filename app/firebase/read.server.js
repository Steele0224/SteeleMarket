import { getServerFirebase } from "./firebase.server"


export async function getUserWithUid(uid) {
  const { firebaseAdminAuth, firebaseDb } = getServerFirebase();
  const authUser = firebaseAdminAuth.getUser(uid)

  if (!authUser) {
    throw new Error("User not found")
  }

  return authUser
}