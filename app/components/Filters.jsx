import { Container, rem, Text, Divider, Accordion } from "@mantine/core";
import { RangeSlider } from "@mantine/core";
import { MultiSelectCheckbox } from "./MutliSelectCheckbox";
import * as ProductData from "../assets/productData";
import { Form as RemixForm, useSubmit } from "@remix-run/react";
import { useDebouncedState } from "@mantine/hooks";
import { useEffect } from "react";

const marksSmall = [
  { value: 0, label: "$0" },
  { value: 5, label: "$5" },
  { value: 10, label: "$10" },
  { value: 15, label: "$15" },
  { value: 20, label: "$20" },
  { value: 25, label: "$25" },
  { value: 30, label: "$30" },
];

export function Filters() {
  const [priceValue, setPriceValue] = useDebouncedState([0, 30], 200);

  const submit = useSubmit();
  useEffect(() => {
    submit(
      { forminput: priceValue, name: "PRICE", intent: "filter" },
      { method: "post" }
    );
  }, [priceValue]);

  return (
    <>
      <Text size="lg">Price</Text>
      <RemixForm method="post" onSubmit={(e) => e.preventDefault()}>
        <Container py="lg">
          <RangeSlider
            step={0.5}
            marks={marksSmall}
            minRange={1}
            max={30}
            label={(value) => `$${value}`}
            onChange={(value) => {
              setPriceValue(value);
            }}
            defaultValue={priceValue}
          />
        </Container>
      </RemixForm>

      <Text size="lg" my="sm">
        Product Name
      </Text>
      {MultiSelectCheckbox("NAME", ProductData.NAME, "Pick a product name")}

      <Text size="lg" my="sm">
        Category
      </Text>
      {MultiSelectCheckbox("CATEGORY", ProductData.CATEGORY, "Pick a category")}

      <Text size="lg" my="sm">
        Brand
      </Text>
      {MultiSelectCheckbox("BRAND", ProductData.BRAND, "Pick a brand")}

      <Text size="lg" my="sm">
        Health Star Rating
      </Text>
      {MultiSelectCheckbox(
        "HEALTH_RATING",
        ProductData.HEALTH_RATING,
        "Pick a Health Star Rating"
      )}
    </>
  );
}

export function filterProducts(products, filters) {
  if (filters != undefined) {
    const filteredProducts = products.filter((product) => {
      let currentFilter = true;

      Object.keys(filters).map((filterName) => {
        if (filters[filterName].length > 0 && filters[filterName][0] != "") {
          if (product[filterName]) {
            if (filterName != "PRICE") {
              currentFilter =
                currentFilter &&
                filters[filterName].includes(product[filterName]);
            }
          } else if (filterName == "PRICE") {
            currentFilter =
              product.ORIGINAL_PRICE >= filters[filterName][0] &&
              product.ORIGINAL_PRICE <= filters[filterName][1];
          }
        }
      });

      return currentFilter;
    });
    return filteredProducts;
  } else return products;
}
