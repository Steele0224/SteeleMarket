import {
  Text,
  Title,
  SimpleGrid,
  TextInput,
  Textarea,
  Button,
  Group,
  ActionIcon,
  Container,
} from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
} from "@tabler/icons-react";
import classes from "./ContactUs.module.css";
import {
  useActionData,
  useNavigation,
  Form as RemixForm,
} from "@remix-run/react";
import * as React from "react";

const social = [IconBrandTwitter, IconBrandYoutube, IconBrandInstagram];

export function ContactUs() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const emailRef = React.useRef("");
  const usernameRef = React.useRef("");
  const messageRef = React.useRef("");
  const formRef = React.useRef(null);

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.username) {
      usernameRef.current?.focus();
    } else if (actionData?.errors?.message) {
      messageRef.current?.focus();
    }
  }, [actionData]);

  React.useEffect(() => {
    if (navigation.state === "idle" && actionData?.success) {
      formRef.current?.reset();
    }
  }, [navigation.state, actionData]);

  const icons = social.map((Icon, index) => (
    <ActionIcon
      key={index}
      size={28}
      className={classes.social}
      variant="transparent"
    >
      <Icon size="1.4rem" stroke={1.5} />
    </ActionIcon>
  ));

  return (
    <Container size="xl">
      <div className={classes.wrapper}>
        <SimpleGrid
          cols={{ base: 1 }}
          spacing={50}
          className={classes.grid}
        >
          <div>
            <Title className={classes.title}>Contact us</Title>
            <Text className={classes.description} mt="sm" mb={30}>
              Leave a message and we'll get back to you within 24 hours.
            </Text>
            <RemixForm className={classes.form} method="post" ref={formRef}>
              <TextInput
                label="Email"
                placeholder="your@email.com"
                required
                id="email"
                ref={emailRef}
                name="email"
                type="email"
                autoFocus
                error={actionData?.errors?.email}
                classNames={{ input: classes.input, label: classes.inputLabel }}
              />
              <TextInput
                label="Name"
                placeholder="John Doe"
                mt="md"
                required
                id="username"
                ref={usernameRef}
                name="username"
                error={actionData?.errors?.username}
                classNames={{ input: classes.input, label: classes.inputLabel }}
              />
              <Textarea
                required
                label="Your message"
                placeholder="Your message"
                id="message"
                ref={messageRef}
                name="message"
                error={actionData?.errors?.message}
                autosize
                minRows={4}
                mt="md"
                classNames={{ input: classes.input, label: classes.inputLabel }}
              />

              <Group justify="flex-end" mt="md">
                <Button className={classes.control} type="submit">
                  Send message
                </Button>
              </Group>
            </RemixForm>
          </div>
        </SimpleGrid>
      </div>
    </Container>
  );
}
