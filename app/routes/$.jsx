import { Image, Container, Title, Text, Button, SimpleGrid } from '@mantine/core';
import classes from './$.module.css';

export default function NotFoundImage() {
  return (
    <Container className={classes.root}>
      <h1>Page not found</h1>
    </Container>
  );
}