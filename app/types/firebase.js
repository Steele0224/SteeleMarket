import { z } from "zod"

import { CREATED_AT, OWNER_ID, MEMBER_IDS } from "../firebase/constants"

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string()
})

export const FirebaseOptionsSchema = z.object({
  apiKey: z.string().optional(),
  authDomain: z.string().optional(),
  databaseURL: z.string().optional(),
  projectId: z.string().optional(),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().optional(),
  measurementId: z.string().optional()
})
