import { json, redirect } from "@remix-run/node";
import { getDomainUrl, getStripeSession } from "../providers/stripe.server";
import { authGetSession } from "../sessions/auth.server";
import { getCookie } from "../utils/getCookie";
import { ACCESS_TOKEN, SET_COOKIE, VALIDATION_STATE_ERROR } from "../types";
import { getServerFirebase } from "../firebase";
import {
  validationCommitSession,
  validationGetSession,
} from "../sessions/validationStates.server";

export async function action({ request }) {
  if (request.method !== "POST") {
    return json({ message: "Method not allowed" }, 405);
  }
  const formData = await request.formData();
  
  const cartItems = JSON.parse(formData.get("data"));

  const { firebaseAdminAuth } = getServerFirebase();
  try {
    const authSession = await authGetSession(getCookie(request));
    const token = authSession.get(ACCESS_TOKEN);
    const decodedToken = await firebaseAdminAuth.verifySessionCookie(token);
    // console.log("decoded token", decodedToken);
    const stripeRedirectUrl = await getStripeSession(cartItems, getDomainUrl(request), decodedToken.user_id)

    return redirect(stripeRedirectUrl);
  } catch (error) {
    // console.log("error in /buy ", error)
    const validationSession = await validationGetSession(getCookie(request));
    validationSession.flash(
      VALIDATION_STATE_ERROR,
      "Please login or signup before proceeding to checkout"
    );
    const validationCommitedSession = await validationCommitSession(
      validationSession
    );

    return redirect("/login", {
      headers: [[SET_COOKIE, validationCommitedSession]],
    });
  }
}

export default function Buy() {
  return <></>;
}
