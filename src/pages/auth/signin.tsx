import { getCsrfToken, signIn } from "next-auth/react";
import Logo from "@/components/Logo";
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  LoadingOverlay,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useState } from "react";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { logger } from "@/lib/logger";
import _ from "underscore";
import { IconAlertCircle } from "@tabler/icons";
import { ApiPost } from "@/utils/network";
import { Device, useDevice } from "@/services/UseDevice";

export enum errorKeys {
  sessionRequired = "sessionRequired",
  maintenance = "maintenance",
  invalidCredentials = "invalidCredentials",
  internalServerError = "internalServerError",
  serviceDown = "serviceDown",
  twoFactorFailed = "twoFactorFailed",
}

export const errorMessages = {
  [errorKeys.sessionRequired]:
    "To access the platform, you have to be signed in",
  [errorKeys.maintenance]: "Maintenance mode",
  [errorKeys.invalidCredentials]: "Bad username or password",
  [errorKeys.internalServerError]: "Internal Server Error",
  [errorKeys.serviceDown]: "Authentication service down",
  [errorKeys.twoFactorFailed]: "2FA failed",
};

export default function SignIn({ csrfToken, error }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [qrRequired, setQrRequired] = useState<boolean>(false);

  const form = useForm({
    initialValues: {
      account: "13050105",
      password: "atc12345",
      rememberMe: false,
      twoFactorCode: "",
    },

    // functions will be used to validate values at corresponding key
    validate: {
      account: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      password: (value) => (value.length === 0 ? "Invalid password" : null),
    },
  });

  /*  useEffect(() => {
      if (status === "authenticated" && session && !_.isEmpty(session.user)) {
        setLoading(true);
        router.push("/", {
          query: {
            callbackUrl: router.query.callbackUrl,
          },
        });
      }
    }, [status]);
  */

  async function signMeIn(values: any) {
    setLoading(true);

    let continueWithLogin = true;

    if (!values.twoFactorCode) {
      let preflightResponse;
      try {
        preflightResponse = await ApiPost(`/api/auth/preflight`, { ...values });
      } catch (error) {
        const jsonResponse = await error.json();
        if (jsonResponse && jsonResponse.redirect) {
          router.push(jsonResponse.redirect);
        } else {
          router.push(`?error=${errorKeys.internalServerError}`);
        }
        continueWithLogin = false;
      }

      if (preflightResponse && preflightResponse.twoFactorEnabled) {
        setQrRequired(true);
        continueWithLogin = false;
      }
    }

    if (continueWithLogin) {
      try {
        const body = { ...values };
        let res = await signIn("credentials", {
          ...body,
          callbackUrl: router.query.callbackUrl,
        });
        return; // return - dont wait for setLoading
      } catch (error) {
        logger.error(error);
      }
    }

    setLoading(false);
  }

  const device = useDevice();

  return (
    <>
      <Container size={420} my={40} h={"100%"}>
        <Stack align={"center"}>
          <Logo href={"/"} width={200} height={"auto"} />

          {process.env.NEXT_PUBLIC_HOMEPAGE && (
            <Text color="dimmed" size="sm" align="center" mt={5}>
              Do not have an account yet?{" "}
              <Anchor<"a">
                href="https://atcbrokers.com/"
                size="sm"
                title="ATC brokers"
              >
                Create account
              </Anchor>
            </Text>
          )}

          <Paper
            withBorder={device !== Device.Mobile}
            shadow="md"
            p={"md"}
            mt={30}
            radius="md"
          >
            <LoadingOverlay visible={loading} />
            <Stack spacing={"md"}>
              {error && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Login error"
                  color="red"
                >
                  {errorMessages[error] || errorMessages.internalServerError}
                </Alert>
              )}
              <form
                onSubmit={form.onSubmit(signMeIn)}
                autoComplete="true"
                action={'/api/auth/callback/credentials'}
              >
                <input
                  name="csrfToken"
                  type="hidden"
                  defaultValue={csrfToken}
                />
                <TextInput
                  label="Account"
                  placeholder="123456"
                  {...form.getInputProps("account")}
                  required
                  mb="md"
                  name="account"
                  autoComplete="true"
                />
                <PasswordInput
                  label="Password"
                  placeholder="Your password"
                  required
                  mb="md"
                  {...form.getInputProps("password")}
                  name="password"
                  autoComplete="true"
                />
                {qrRequired && (
                  <TextInput
                    label="2FA Code"
                    placeholder="xxxxxx"
                    {...form.getInputProps("twoFactorCode")}
                    required
                  />
                )}
                <Group position="apart" mt="lg">
                  <Checkbox label="Remember me"  sx={{ lineHeight: 1 }} {...form.getInputProps("rememberMe")} />
                  {process.env.NEXT_PUBLIC_HOMEPAGE && (
                    <Anchor<"a">
                      href="https://atcbrokers.com/login/"
                      size="sm"
                      title="ATC brokers login"
                    >
                      Forgot password?
                    </Anchor>
                  )}
                </Group>
                <Button fullWidth mt="xl" type={"submit"}>
                  Sign in
                </Button>
              </form>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  const query = context.query;

  return {
    props: {
      csrfToken: (await getCsrfToken(context)) || null,
      ...query,
    },
  };
}
