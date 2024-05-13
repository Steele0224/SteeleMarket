import { ProductCard } from "./ProductCard";
import { Flex, Button } from "@mantine/core";
import { prebuiltPCData } from "../assets/productData";
import {
  IconDatabase,
  IconGauge,
  IconAlarmAverage,
  IconCpu,
} from "@tabler/icons-react";
import { Grid } from "@mantine/core";
import { useActionData } from "@remix-run/react";
import { filterProducts } from "./Filters";

export function Products({ filters }) {
  const productsToShow = filterProducts(prebuiltPCData, filters);

  const showProducts = productsToShow.map((item, index) => {
    const itemFeatures = [
      { label: "Brand: " + item.BRAND},
      { label: item.DESCRIPTION},
      { label: "Health Rating: " + item.HEALTH_RATING},

    ];

    return (
      <Grid.Col key={item.ID + " " + index} span={{ base: 12, sm: 6, lg: 3 }}>
        <ProductCard
          title={item.NAME}
          price={item.ORIGINAL_PRICE}
          subtitle=""
          itemFeatures={itemFeatures}
          image={item.IMAGE}
          intent="ourproducts"
          id={item.ID}
        />
      </Grid.Col>
    );
  });

  return (
    <Grid justify="flex-start" align="stretch">
      {showProducts}
    </Grid>
  );
}
