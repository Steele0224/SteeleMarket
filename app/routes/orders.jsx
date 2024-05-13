import { json } from "@remix-run/node";
import { getServerFirebase, getUserWithUid } from "../firebase";
import { authGetSession } from "../sessions/auth.server";
import { getCookie } from "../utils/getCookie";
import { ACCESS_TOKEN, INTENT } from "../types";
import { redirect } from "@remix-run/node"; // or cloudflare/deno
import { useLoaderData } from "@remix-run/react";

import { Divider, Grid, NumberFormatter, Stack, Title } from "@mantine/core";
import { ORDERS_COLLECTION } from "../firebase/constants";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { prebuiltPCData } from "../assets/productData";
import { Group, Avatar, Text, Accordion, Badge } from "@mantine/core";
import styles from "./orders.module.css";
import dayjs from "dayjs";
import { IconFileInvoice, IconPackage } from "@tabler/icons-react";

import { Image, Container, Button, SimpleGrid } from "@mantine/core";
import classes from "./$.module.css";

export const meta = () => {
  return [
    { title: "Steele market | Orders" },
    { name: "Orders", content: "Orders" },
  ];
};

export const action = async ({ request }) => {
  return json({ status: 200 });
};

export const loader = async ({ request }) => {
  const { firebaseDb, firebaseAdminAuth } = getServerFirebase();

  const authSession = await authGetSession(getCookie(request));
  const token = authSession.get(ACCESS_TOKEN);

  try {
    const { uid } = await firebaseAdminAuth.verifySessionCookie(token);

    const ordersCollection = collection(firebaseDb, ORDERS_COLLECTION);
    const ordersQuery = query(ordersCollection, where("user_id", "==", uid), orderBy("session.created", "desc"));
    const ordersSnapshot = await getDocs(ordersQuery);
    let orders = ordersSnapshot.docs.map((doc) => doc.data());

    orders = orders.map((order) => {
      const orderItems = order.lineItems.map((orderProduct) => {
        const foundProduct = prebuiltPCData.find(
          (prebuiltPCData_product) =>
            prebuiltPCData_product.ID == orderProduct.price.id
        );
        return { quantity: orderProduct.quantity, ...foundProduct };
      });
      return {
        items: orderItems,
        timestamp: order.timestamp,
        user_id: order.user_id,
        session: order.session,
      };
    });

    return json(orders);
  } catch (error) {
    console.log("order loader error", error);
    return redirect("/login");
  }
};

export default function Orders() {
  const orders = useLoaderData();

  const items = orders.map((order) => {
    const shippingCost = order.session.shipping_cost.amount_total;
    const createdDate = order.session.created;
    const address = order.session.shipping_details.address;
    return (
      <Accordion.Item key={order.session.id} value={order.session.id}>
        <Accordion.Control className={styles.orderIfActive}>
          <Grid>
            <Grid.Col span="content">
              <Avatar radius="xl" size="lg">
                <IconFileInvoice />
              </Avatar>
            </Grid.Col>
            <Grid.Col span="content">
              <Stack align="flex-start" justify="flex-start" gap="5">
                <Text fw={700}>{"Order #" + order.session.id.slice(-6)}</Text>
                <Text size="sm" fw={400}>
                  {dayjs.unix(createdDate).format("DD/MM/YYYY HH:mm")}
                </Text>
                <Text size="sm" fw={400}>
                  {"(In process)"}
                </Text>
                <Text
                  size="sm"
                  c="dimmed"
                  fw={400}
                  className={styles.detailsText}
                >
                  {"Click for details"}
                </Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span="auto"></Grid.Col>
            <Grid.Col span="content">
              <Stack align="flex-end" justify="flex-start" gap="xs">
                <Badge
                  variant="light"
                  color="green"
                  style={{ textTransform: "none" }}
                >
                  {"Order Total: "}
                  <NumberFormatter
                    prefix="$"
                    value={order.session.amount_subtotal / 100}
                    thousandSeparator
                    decimalScale={2}
                    fixedDecimalScale
                  />
                </Badge>
                <Badge
                  variant="light"
                  color="blue"
                  style={{ textTransform: "none" }}
                >
                  {shippingCost == 0
                    ? "Free Pickup"
                    : "Shipping: $" + shippingCost / 100}
                </Badge>
              </Stack>
            </Grid.Col>
          </Grid>
        </Accordion.Control>

        <Accordion.Panel>
          <Grid mb={"sm"}>

            {order.items.map((product) => {
              return (
                <>
                  <Grid.Col key={product.ID} span="content">
                    <Avatar
                      src={`/ourproducts/${product.IMAGE}`}
                      radius="xl"
                      size="lg"
                    />
                  </Grid.Col>
                  <Grid.Col span="auto">
                    <Text>{product.NAME}</Text>
                    <Text size="sm" c="dimmed" fw={400}>
                      {product.DESCRIPTION}
                    </Text>
                  </Grid.Col>
                  <Grid.Col span="content">
                    <Stack align="flex-end" justify="flex-start" gap="xs">
                      <Badge variant="outline" color="green">
                        <NumberFormatter
                          prefix="$"
                          value={product.ORIGINAL_PRICE}
                          thousandSeparator
                          decimalScale={2}
                          fixedDecimalScale
                        />
                      </Badge>
                      <Badge
                        variant="outline"
                        color="blue"
                        style={{ textTransform: "none" }}
                      >
                        <NumberFormatter prefix="x" value={product.quantity} />
                      </Badge>
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={12}></Grid.Col>
                </>
              );
            })}
          </Grid>
        </Accordion.Panel>
      </Accordion.Item>
    );
  });

  const noOrders = () => {
    return (<Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1 }}>
        <div>
          <Title className={classes.title}>
            Your order list is empty...
          </Title>
        </div>
      </SimpleGrid>
    </Container>)
    
  };

  return (
    <>
      {orders.length == 0 ? (
        noOrders()
      ) : (
        <>
          <Title m="sm">Your Orders</Title>
          <Accordion multiple={true}>{items}</Accordion>
        </>
      )}
    </>
  );
}
