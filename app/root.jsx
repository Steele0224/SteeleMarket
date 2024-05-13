import { cssBundleHref } from "@remix-run/css-bundle";
import styles from "./root.module.css";

import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

import { getServerFirebase } from "./firebase/firebase.server";
import { FirebaseProvider } from "./providers/FirebaseProvider";
import { authGetSession } from "./sessions/auth.server";
import {
  validationCommitSession,
  validationGetSession,
} from "./sessions/validationStates.server";
import {
  ACCESS_TOKEN,
  SET_COOKIE,
  VALIDATION_STATE_ERROR,
  VALIDATION_STATE_SUCCESS,
  CART_DATA,
} from "./types";
import { FirebaseOptionsSchema } from "./types/firebase";
import { getCookie } from "./utils/getCookie";

import "@mantine/core/styles.css";
import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import { HeaderMenu } from "./components/HeaderMenu";
import { getUserWithUid } from "./firebase";
import { SpeedInsights } from "@vercel/speed-insights/remix";
import { useCartState } from "./providers/useCart";
import { updatedCartCookieHeaders } from "./providers/useCart";

export const links = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

function getValidationTexts(validationSession) {
  const validationSessionErrorText =
    z
      .string()
      .optional()
      .parse(validationSession.get(VALIDATION_STATE_ERROR)) ?? null;
  const validationSessionSuccessText =
    z
      .string()
      .optional()
      .parse(validationSession.get(VALIDATION_STATE_SUCCESS)) ?? null;

  return { validationSessionErrorText, validationSessionSuccessText };
}


export const loader = async ({ request }) => {
  const { firebaseAdminAuth, firebaseDb } = getServerFirebase();

  const options = FirebaseOptionsSchema.parse(firebaseDb.app.options);

  const validationSession = await validationGetSession(getCookie(request));
  const validationTextsData = getValidationTexts(validationSession);

  const authSession = await authGetSession(getCookie(request));

  const token = authSession.get(ACCESS_TOKEN);
  let cartData = validationSession.get(CART_DATA);
  cartData = cartData ? JSON.parse(cartData) : undefined;

  const sessionHeaders = {
    headers: {
      [SET_COOKIE]: await validationCommitSession(validationSession),
    },
  };

  try {
    const decodedToken = await firebaseAdminAuth.verifySessionCookie(token);

    const userToken = await firebaseAdminAuth.createCustomToken(
      decodedToken.uid
    );

    const user = await getUserWithUid(decodedToken.uid);
    return json(
      {
        ...validationTextsData,
        firebase: { options, userToken, user },
        cartData,
      },
      sessionHeaders
    );
  } catch (error) {
    return json({ ...validationTextsData, firebase: null }, sessionHeaders);
  }
};

export default function App() {
  const loaderData = useLoaderData();
  const setCartData = useCartState((state) => state.setCartData);

  const { validationSessionErrorText, validationSessionSuccessText, firebase } =
    loaderData;

  useEffect(() => {
    if (validationSessionErrorText) {
      toast.error(validationSessionErrorText);
    }

    if (validationSessionSuccessText) {
      toast.success(validationSessionSuccessText);
    }

    if (loaderData.cartData) {
      setCartData(loaderData.cartData);
    }
  }, [loaderData, validationSessionErrorText, validationSessionSuccessText]);

  const error = useRouteError();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <ColorSchemeScript defaultColorScheme="dark" />
      </head>
      <body>
        <FirebaseProvider firebase={firebase}>
          <MantineProvider defaultColorScheme="dark">
            <div className={styles.maincontents}>
              <div>
                <HeaderMenu user={firebase?.user ? firebase.user : undefined} />
                <Outlet />
              </div>
            </div>
            <ScrollRestoration />
            <Scripts />
            <LiveReload />
          </MantineProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  if (formData.get("intent") == "ourproducts") {
    const cartData = formData.get("cartData");
    const headers = await updatedCartCookieHeaders(request, cartData);
    return json(
      {
        message: "this is ourproducts respnse and not filters",
        status: 201,
      },
      headers
    );
  } else {
    return json({ status: 200 });
  }
};
