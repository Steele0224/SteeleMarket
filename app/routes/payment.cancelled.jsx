import { Image, Container, Title, Text, Button, SimpleGrid } from '@mantine/core';
import image from "../assets/images/paymentcancelled.svg";
import classes from './$.module.css';
import { Link } from '@remix-run/react';

export default function PaymentCancelled() {
  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 1, sm: 2 }}>
        <Image src={image} />
        <div>
          <Title className={classes.title}>Transaction cancelled</Title>
          <Text c="dimmed" size="lg">
            Looks like your order didn't go through - don't worry, you weren't charged.
          </Text>
          <Button component={Link} to="/" variant="outline" size="md" mt="xl" className={classes.control}>
            Go back to home page
          </Button>
        </div>
        <Image src={image.src} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
  );
}