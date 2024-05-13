import {
  Container,
  Grid,
  SimpleGrid,
  Skeleton,
  rem,
  Text,
} from "@mantine/core";
import { Filters } from "../components/Filters";
import { redirect, useActionData } from "@remix-run/react";
import { json } from "@remix-run/node";
import { useState } from "react";
import * as React from "react";
import { Products } from "../components/Products";
import { useCartState } from "../providers/useCart";
import { updatedCartCookieHeaders } from "../providers/useCart";

const PRIMARY_COL_HEIGHT = rem(300);

export const meta = () => {
  return [
    { title: "Steele Market | Our Products" },
    { name: "Our Products", content: "Our Products" },
  ];
};

export default function OurProducts() {
  const actionData = useActionData(undefined);
  const [filters, setFilters] = useState(undefined);

  React.useEffect(() => {
    // console.log("actionData", actionData)
    if (actionData?.intent == "filter" && actionData?.selectedProducts) {
      const newFilters = actionData ? { ...filters } : undefined;
      if (newFilters) {
        newFilters[actionData?.filterName] = actionData?.selectedProducts;
      }
      setFilters(newFilters);
    }
  }, [actionData]);

  return (
    <Container my="md" size="100%">
      <Grid gutter="sm">
        <Grid.Col span={{ base: 12, sm: 3 }}>
          <Filters />
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 9 }}>
          <Products filters={filters} />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

export const action = async ({ request }) => {
  const formData = await request.formData();
  if (formData?.get("intent") == "filter") {
    const returnObj = {
      intent: "filter",
      selectedProducts: formData.get("forminput").split(","),
      filterName: formData.get("name"),
    };
    return json(returnObj, { status: 201 });
  } else if (formData.get("intent") == "ourproducts") {
    // console.log("prbuiltpcs aciton")
    const cartData = formData.get("cartData");
    const headers = await updatedCartCookieHeaders(request, cartData);

    return json(
      {
        message: "this is ourproducts respnse and not filters",
        status: 201,
      },
      headers
    ); //should be an error here
  } else return json({ status: 200 }); //should be an error here
};
