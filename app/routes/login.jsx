import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useLoaderData,
  useNavigation as useTransition,
} from "@remix-run/react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth";
import { z } from "zod";
import { zfd } from "zod-form-data";

import styles from "./login.module.css";

import {
  createUserWithUserData,
  getServerFirebase,
  getUserWithUid,
} from "../firebase";
import { authCommitSession, authGetSession } from "../sessions/auth.server";
import {
  validationCommitSession,
  validationGetSession,
} from "../sessions/validationStates.server";
import {
  ACCESS_TOKEN,
  FIVE_DAYS_IN_MILLISECONDS,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
  VALIDATION_STATE_SUCCESS,
} from "../types";
import { getCookie } from "../utils/getCookie";
import { AuthenticationForm } from "../components/AuthenticationForm";

const SIGNED_IN_SUCCESS_MESSAGE = "Signed in successfully!";
const SIGNED_UP_SUCCESS_MESSAGE = "Signed up successfully!";
const SOMETHING_WENT_WRONG_MESSAGE =
  "Something went wrong, please fill in the values again!";

export default function Login() {
  const transition = useTransition();
  const loaderData = useLoaderData();

  return (
    <>
      <AuthenticationForm
        user={loaderData?.success ? loaderData.user : undefined}
      />
    </>
  );
}

const FormSchema = zfd
  .formData({
    email: z.string().email(),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    username: z.string().optional(),
    terms: zfd.checkbox(),
    loginOrRegister: z.string(),
  })
  .refine(
    (data) => (data.loginOrRegister === "register" ? data.username : true),
    {
      message: "Missing username",
    }
  );

export const loader = async ({ request }) => {
  const { firebaseAdminAuth } = getServerFirebase();

  const authSession = await authGetSession(getCookie(request));
  const token = authSession.get(ACCESS_TOKEN);

  try {
    const { uid } = await firebaseAdminAuth.verifySessionCookie(token);

    const user = await getUserWithUid(uid);
    return json({ success: true, user: user });
  } catch (error) {
    return json({ success: false, status: 400 });
  }
};

export const action = async ({ request }) => {
  const { firebaseAuth, firebaseAdminAuth } = getServerFirebase();
  const [formData, validationSession, authSession] = await Promise.all([
    request.formData(),
    validationGetSession(getCookie(request)),
    authGetSession(getCookie(request)),
  ]);

  const googleLogin = formData.get("googleLogin");

  const email = formData.get("email");
  const password = formData.get("password");
  const username = formData.get("username");
  const terms = formData.get("terms");
  const loginOrRegister = formData.get("loginOrRegister");

  const dataObject = FormSchema.safeParse(formData);

  const errors = !dataObject.success
    ? ((dataObject) => {
        const errorList = {};
        for (let data of dataObject.error.issues) {
          errorList[data.path[0]] = data.message;
        }
        return errorList;
      })(dataObject)
    : null;

  if (errors) return json({ errors: errors }, { status: 400 });

  if (loginOrRegister === "login" && !googleLogin) {
    try {
      const { user } = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      authSession.set(
        ACCESS_TOKEN,
        await firebaseAdminAuth.createSessionCookie(await user.getIdToken(), {
          expiresIn: FIVE_DAYS_IN_MILLISECONDS,
        })
      );
      validationSession.flash(
        VALIDATION_STATE_SUCCESS,
        SIGNED_IN_SUCCESS_MESSAGE
      );

      const [authCommittedSession, validationCommitedSession] =
        await Promise.all([
          authCommitSession(authSession),
          validationCommitSession(validationSession),
        ]);

      return redirect("/", {
        headers: [
          [SET_COOKIE, authCommittedSession],
          [SET_COOKIE, validationCommitedSession],
        ],
      });
    } catch (error) {
      return json(
        {
          errors: {
            email: "Login details incorrect",
            password: "Login details incorrect",
          },
        },
        { status: 400 }
      );
    }
  } else if (loginOrRegister === "register" && !googleLogin) {
    try {
      console.log("dataobject", dataObject)
      const { user } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      updateProfile(user, {displayName: username})

      // console.log("user in regster", user)

      const [token] = await Promise.all([
        firebaseAdminAuth.createSessionCookie(await user.getIdToken(), {
          expiresIn: FIVE_DAYS_IN_MILLISECONDS,
        }),
        createUserWithUserData({ email, username, id: user.uid }),
      ]);

      authSession.set(ACCESS_TOKEN, token);
      validationSession.flash(
        VALIDATION_STATE_SUCCESS,
        SIGNED_UP_SUCCESS_MESSAGE
      );

      const [authCommittedSession, validationCommitedSession] =
        await Promise.all([
          authCommitSession(authSession),
          validationCommitSession(validationSession),
        ]);

      return redirect("/", {
        headers: [
          [SET_COOKIE, authCommittedSession],
          [SET_COOKIE, validationCommitedSession],
        ],
      });
    } catch (error) {
      console.log("register error", error)
      validationSession.flash(
        VALIDATION_STATE_ERROR,
        SOMETHING_WENT_WRONG_MESSAGE
      );

      const validationCommitedSession = await validationCommitSession(
        validationSession
      );

      return json(
        {status: 400},
        {
          headers: [[SET_COOKIE, validationCommitedSession]],
        }
      );
    }
  } else return json({ status: 200 });
};
