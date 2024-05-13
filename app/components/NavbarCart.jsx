import { useState } from "react";
import { Button, Center, Group, NumberFormatter, Table } from "@mantine/core";
import classes from "./NavbarCart.module.css";
import steeleMarketLogo from "../assets/images/logo512.png";
import {
  Form as RemixForm,
  Link,
  useSubmit,
  useFetcher,
} from "@remix-run/react";
import { useCartState } from "../providers/useCart";
import { ActionIcon } from "@mantine/core";
import {
  IconPencil,
  IconTrash,
  IconPlus,
  IconMinus,
} from "@tabler/icons-react";

export function NavbarCart({ toggle }) {
  const data = useCartState((state) => state.cart);
  const cartState = useCartState((state) => state.showCart);
  const toggleShowCart = useCartState((state) => state.toggleShowCart);
  const removeItem = useCartState((state) => state.removeFromCart);
  const addToCart = useCartState((state) => state.addToCart);
  const subtractFromCart = useCartState(state => state.subtractFromCart)
  const total = useCartState((state) => state.totalPrice);
  const totalItems = useCartState((state) => state.totalItems);
  const fetcher = useFetcher({ key: "add-to-bag" });
  const submit = useSubmit();

  const rows = data.map((item) => {
    return (
      <Table.Tbody key={item.id + "Tbody"}>
        <Table.Tr key={item.id}>
          <Table.Td className={classes.productname}>{item.title}</Table.Td>
          <Table.Td>
            <Center>{item.quantity}</Center>
          </Table.Td>
          <Table.Td>
            <Center>
              <NumberFormatter
                prefix="$"
                value={item.price}
                thousandSeparator
                decimalScale={2}
                fixedDecimalScale
              />
            </Center>
          </Table.Td>
          <Table.Td>
            <fetcher.Form method="post" action="/ourproducts">
              <Group gap={0} mb={"xs"} justify="center">
              </Group>
              <Group gap={0} justify="center">
                <ActionIcon variant="light" color="blue" size="sm">
                  <IconMinus
                    onClick={(event) => {
                      event.preventDefault();
                      const cartData = subtractFromCart(item);
                      fetcher.submit(
                        {
                          cartData: JSON.stringify(cartData),
                          intent: "ourproducts",
                        },
                        { method: "post" }
                      );
                    }}
                  />
                </ActionIcon>
                <ActionIcon variant="light" color="blue" size="sm">
                  <IconPlus
                    onClick={(event) => {
                      event.preventDefault();
                      const cartData = addToCart(item);
                      fetcher.submit(
                        {
                          cartData: JSON.stringify(cartData),
                          intent: "ourproducts",
                        },
                        { method: "post" }
                      );
                    }}
                  />
                </ActionIcon>
              </Group>
            </fetcher.Form>
          </Table.Td>
        </Table.Tr>
      </Table.Tbody>
    );
  });

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <Link to="/" onClick={toggle}>
          <img src={steeleMarketLogo} className={classes.steeleMarketLogo} />
          </Link>
        </Group>
        {data.length > 0 ? (
          <>
            <Table withRowBorders={true} className={classes.table}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={classes.productname}>Item</Table.Th>
                  <Table.Th>
                    <Center>Quantity</Center>
                  </Table.Th>
                  <Table.Th>
                    <Center>Price</Center>
                  </Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              {rows}
              <Table.Tfoot>
                <Table.Tr>
                  <Table.Th className={classes.total}>Total</Table.Th>
                  <Table.Th className={classes.total}>
                    <Center>{totalItems}</Center>
                  </Table.Th>
                  <Table.Th className={classes.total}>
                    <Center>
                      <NumberFormatter
                        prefix="$"
                        value={total}
                        thousandSeparator
                        fixedDecimalScale
                        decimalScale={2}
                      />
                    </Center>
                  </Table.Th>
                  <Table.Th className={classes.total} />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
            <RemixForm method="post" action="/buy">
              <input type="hidden" name="data" value={JSON.stringify(data)} />
              <Group grow mt={20}>
                <Button
                  type="submit"
                  className={classes.animatedButton}
                  radius="xl"
                  onClick={toggle}
                >
                  Go to checkout
                </Button>
              </Group>
            </RemixForm>
          </>
        ) : (
          <Center m={100}>Your cart is empty.</Center>
        )}
      </div>
    </nav>
  );
}
