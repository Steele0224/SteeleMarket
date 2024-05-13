import {
  Image,
  Container,
  Title,
  Text,
  Button,
  SimpleGrid,
} from "@mantine/core";
import image from "../assets/images/paymentsuccess.svg";
import classes from "./$.module.css";
import { Link, json } from "@remix-run/react";
import Stripe from "stripe";
import { getServerFirebase } from "../firebase";
import { addDoc, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { collection, getDocs, query, where } from "firebase/firestore";

import {
  CUSTOMER_CONTACT_COLLECTION,
  ORDERS_COLLECTION,
} from "../firebase/constants";


export default function PaymentSuccess() {
  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image src={image} />
        <div>
          <Title className={classes.title}>Congratulations!</Title>
          <Text c="dimmed" size="lg">
            Thanks! We've got your
            order and it'll be with you soon.
          </Text>
          <Button
            component={Link}
            to="/"
            variant="outline"
            size="md"
            mt="xl"
            className={classes.control}
          >
            Go back to home page
          </Button>
        </div>
        <Image src={image.src} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
  );
}

export const action = async ({ request }) => {
  const { firebaseDb } = getServerFirebase();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const secret = process.env.WEBHOOK_SIGNING_SECRET_LIVE;

  // const test_secret =
  //   "whsec_224396d057f37f6abbf6c9cd4653aec5fe437b3f644e37a53b256add912c9216"; 
  const sig = request.headers.get("stripe-signature");
  console.log("SIGGGG", sig)
  let event;
  const payload = await request.text();
  console.log("SIGGpayloadpayloadGG", payload)


  try {
    console.log("TRYIHERINGNGGGGG")
    event = stripe.webhooks.constructEvent(payload, sig, secret);
    console.log("GOT ITTTTTTTT")

    if (event.type == "checkout.session.completed") {
      console.log("RIGHT EHREEEEEE")
      const session = event.data.object;
      const user_id = session.metadata?.user_id;
      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );

      console.log("here 👄👄👄👄")

      // console.log("🥎🏀🏐🏈", lineItems.data);

      await addDoc(collection(firebaseDb, ORDERS_COLLECTION), {
        user_id: user_id ?? "UNKNOWN_USER",
        session,
        lineItems: lineItems.data,
        timestamp: serverTimestamp(),
      });
    }
    return json({ status: 201 });
  } catch (err) {
    //console.log("Error 💀", err);
    return new Response(err.message, {
      status: 400,
    });
  }
};
