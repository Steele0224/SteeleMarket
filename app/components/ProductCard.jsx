import {
  Card,
  Image,
  Text,
  Group,
  Badge,
  Center,
  Button,
  Stack,
} from "@mantine/core";
import classes from "./ProductCard.module.css";
import { NumberFormatter } from "@mantine/core";
import { Form as RemixForm, useFetcher } from "@remix-run/react";
import { useState } from "react";
import { useCartState } from "../providers/useCart";
import { useSubmit } from "@remix-run/react";

export function ProductCard({
  title,
  subtitle,
  price = "",
  itemFeatures = [],
  image,
  label = "Product Description",
  buttonText = "Add to Cart",
  intent,
  id = undefined,
  selected = false,
  COMPONENT_TYPE = undefined,
}) {
  const [buttonTextState, setButtonTextState] = useState(
    buttonText ?? "Add to Cart"
  );

  const setButtonTextAdded = () => {
    if (buttonTextState != "Added!") {
      setButtonTextState("Added!");
      setTimeout(() => {
        setButtonTextState("Add to Cart");
      }, 750);
    }
  };

  const features = itemFeatures.map((feature) => (
    <Center key={feature.label}>
      <Text size="xs">{feature.label}</Text>
    </Center>
  ));

  const addToCart = useCartState((state) => state.addToCart);
  const submit = useSubmit();
  const fetcher = useFetcher({
    key: intent == "ourproducts" ? "cart-function" : undefined,
  });
  return (
    <Card withBorder radius="md" className={classes.card}>
      <Card.Section className={classes.imageSection}>
        <Image
          className={classes.imageSectionImg}
          src={image}
          alt="Tesla Model S"
        />
      </Card.Section>

      <Group justify="space-between" mt="md">
        <div>
          <Text fw={500}>{title}</Text>
          <Text fz="xs" c="dimmed">
            {subtitle}
          </Text>
        </div>
        <Badge size="xl" variant="outline" color="green">
          <NumberFormatter
            prefix="$"
            value={price}
            thousandSeparator
            decimalScale={2}
            fixedDecimalScale
          />
        </Badge>
      </Group>

      <Card.Section className={classes.section} mt="md">
        <Text fz="sm" c="dimmed" className={classes.label}>
          {label}
        </Text>

        <Stack gap={8} mb={-8} align="flex-start" justify="center">
          {features}
        </Stack>
      </Card.Section>

      <Card.Section className={classes.section} mt={"auto"}>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value={intent} />
          <input type="hidden" name="productID" value={id} />
          <Group gap={10}>
            <Button
              type="submit"
              radius="xl"
              style={{ flex: 1 }}
              color={selected ? "grape" : "blue"}
              onClick={
                intent == "ourproducts"
                  ? (event) => {
                      event.preventDefault();
                      if (buttonTextState != "Added!") {
                        const cartData = addToCart({
                          id: id,
                          title: title,
                          price: price,
                        });

                        setButtonTextAdded();
                        fetcher.submit(
                          {
                            cartData: JSON.stringify(cartData),
                            intent: "ourproducts",
                          },
                          { method: "post" }
                        );
                      }
                    }
                  : undefined
              }
              className={
                intent == "ourproducts" ? classes.animatedButton : undefined
              }
            >
              {selected ? "Selected" : buttonTextState}
            </Button>
          </Group>
        </fetcher.Form>
      </Card.Section>
    </Card>
  );
}
