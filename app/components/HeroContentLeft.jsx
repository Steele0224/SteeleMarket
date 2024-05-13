import { Overlay, Container, Title, Button, Text } from "@mantine/core";
import classes from "./HeroContentLeft.module.css";
import { Link } from "@remix-run/react";

export function HeroContentLeft() {
  return (
    <div className={classes.hero}>
      <Overlay
        gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
        opacity={0.9}
        zIndex={0}
      />
      <Container className={classes.container} size="md">
        <Title className={classes.title}>
          Welcome to <br />Steele Market!
        </Title>
        <Text className={classes.description} size="xl" mt="xl">
          Based in Sydney, we provide the highest quality groceries to suit your
          everyday needs. We're proud to offer an extensive range of products that are sustainably sourced and can be delivered straight to your door.
        </Text>

        <Button
          component={Link}
          to="/ourproducts"
          variant="gradient"
          size="xl"
          radius="xl"
          classNames={{root:classes.controlButton, label: classes.controlLabel}}
        >
          Check out our products!
        </Button>
      </Container>
    </div>
  );
}
