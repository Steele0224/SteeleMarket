import { json, redirect } from "@remix-run/node";
import { useToggle, upperFirst } from "@mantine/hooks";
import {
  Form,
  Form as RemixForm,
  Link,
  useActionData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import * as React from "react";
import {
  Anchor,
  Button,
  Center,
  Checkbox,
  Divider,
  Container,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { GoogleButton } from "../assets/images/GoogleButton";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp, getApp } from "firebase/app";
import { config } from "../firebase/firebase-config";
import toast from "react-hot-toast";

const createFirebaseApp = (config = {}) => {
  try {
    return getApp();
  } catch (error) {
    return initializeApp(config);
  }
};

const firebaseApp = createFirebaseApp(config);

export function AuthenticationForm({ user }) {
  const [searchParams] = useSearchParams();
  const actionData = useActionData();
  const emailRef = React.useRef("");
  const passwordRef = React.useRef("");
  const usernameRef = React.useRef("");
  const termsRef = React.useRef(false);
  const loginOrRegisterRef = React.useRef("login");

  const firebaseApp = createFirebaseApp({
    /* your config */
  });

  const [type, toggle] = useToggle(["login", "register"]);
  const submit = useSubmit();
  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus();
    }
    if (actionData?.errors?.googleLoginError) {
      toast.error("Oops! Login failed - try again");
    }
  }, [actionData]);

  return (
    <>
      <Container size="lg" mt="lg">
        <Paper radius="md" p="xl" withBorder>
          <Text size="lg" fw={500}>
            Welcome to Steele Market
            {user
              ? ", " + user.displayName + "! You're already signed in."
              : "! " + upperFirst(type) + " below:"}
          </Text>
          <RemixForm method="post">
            <Stack>
              {type === "register" && (
                <TextInput
                  label="Name"
                  required
                  placeholder="Your name"
                  id="username"
                  ref={usernameRef}
                  name="username"
                  autoFocus
                  error={actionData?.errors?.username}
                  radius="md"
                />
              )}

              <TextInput
                required
                label="Email address"
                placeholder="Your email address"
                id="email"
                ref={emailRef}
                name="email"
                type="email"
                autoFocus
                error={actionData?.errors?.email}
                radius="md"
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                error={actionData?.errors?.password}
                radius="md"
              />

              {type === "register" && (
                <Checkbox
                  required
                  label={
                    <>
                      I accept the{" "}
                      <Anchor
                        href="https://mantine.dev"
                        target="_blank"
                        inherit
                      >
                        terms and conditions
                      </Anchor>
                    </>
                  }
                  id="terms"
                  ref={termsRef}
                  name="terms"
                  type="checkbox"
                  error={actionData?.errors?.terms}
                />
              )}
            </Stack>

            <Group justify="space-between" mt="xl">
              <Anchor
                component="button"
                type="button"
                c="dimmed"
                onClick={() => toggle()}
                size="xs"
              >
                {type === "register"
                  ? "Already have an account? Login"
                  : "Don't have an account? Register"}
              </Anchor>

              <input
                type="hidden"
                id="loginOrRegister"
                name="loginOrRegister"
                value={type}
              />

              <Button type="submit" radius="xl">
                {upperFirst(type)}
              </Button>
            </Group>
          </RemixForm>
        </Paper>
      </Container>
    </>
  );
}
