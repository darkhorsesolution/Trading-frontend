import { getCsrfToken } from "next-auth/react";
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
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { logger } from "@/lib/logger";
import _ from "underscore";
import { IconAlertCircle } from "@tabler/icons";
import { Device, useDevice } from "@/services/UseDevice";
import { useWebSocketAuth } from "@/hooks/useWebSocketAuth";
import { PasswordInput } from "@mantine/core";
import { showNotification } from '@mantine/notifications';

export enum errorKeys {
  sessionRequired = "sessionRequired",
  maintenance = "maintenance",
  invalidCredentials = "invalidCredentials",
  internalServerError = "internalServerError",
  serviceDown = "serviceDown",
  twoFactorFailed = "twoFactorFailed",
  wsConnectionFailed = "wsConnectionFailed",
}

export const errorMessages = {
  [errorKeys.sessionRequired]:
    "To access the platform, you have to be signed in",
  [errorKeys.maintenance]: "Maintenance mode",
  [errorKeys.invalidCredentials]: "Bad username or password",
  [errorKeys.internalServerError]: "Internal Server Error",
  [errorKeys.serviceDown]: "Authentication service down",
  [errorKeys.twoFactorFailed]: "2FA failed",
  [errorKeys.wsConnectionFailed]: "WebSocket connection failed",
};

export default function SignIn({ csrfToken, error }) {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [wsError, setWsError] = useState<string | null>(null);
  const redirectingRef = useRef<boolean>(false);
  
  // WebSocket authentication hook
  const {
    login: wsLogin,
    isConnected,
    isAuthenticated: wsAuthenticated,
    token: wsToken,
    connectionStatus,
  } = useWebSocketAuth();

  const form = useForm({
    initialValues: {
      account: "TESTMAYANK",
      password: "TESTMAYANKTESTMAYANK",
      rememberMe: false,
      twoFactorCode: "",
    },

    validate: {
      account: (value) =>
        value.length < 2 ? "Name must have at least 2 letters" : null,
      password: (value) => (value.length === 0 ? "Invalid password" : null),
    },
  });

  // Monitor WebSocket authentication status and redirect directly
  useEffect(() => {
    if (wsAuthenticated && wsToken && !loading && !redirectingRef.current) {
      redirectingRef.current = true;
      
      // Clear any error states
      setWsError(null);
      
      // Clear URL error parameters by replacing the current URL
      if (router.query.error) {
        router.replace('/auth/signin', undefined, { shallow: true });
      }
      
      // Store authentication info in localStorage for other components
      localStorage.setItem('ws_authenticated', 'true');
      localStorage.setItem('ws_account', form.values.account);
      
      // Show notification only once
      showNotification({
        id: 'login-success', // Prevent duplicate notifications
        title: "Login Successful",
        message: 'Redirecting to terminal...',
        color: 'green',
      });
      
      // Direct redirect to terminal without NextAuth
      setTimeout(() => {
        const redirectUrl = router.query.callbackUrl || "/terminal";
        router.push(redirectUrl as string);
      }, 1000);
    }
  }, [wsAuthenticated, wsToken, loading]);

  async function signMeIn(values: any) {
    setLoading(true);
    setWsError(null);
    console.log('Login attempt with:', values);

    // Check WebSocket connection first
    if (!isConnected) {
      setWsError("WebSocket is not connected. Please wait and try again.");
      setLoading(false);
      showNotification({
        title: "Connection Error",
        message: 'WebSocket is not connected',
        color: 'red',
      });
      return;
    }

    try {
      // Use WebSocket login
      console.log('Calling WebSocket login...');
      const success = await wsLogin(values.account, values.password);
      
      if (!success) {
        setWsError("Invalid credentials or login failed");
        showNotification({
          title: "Login Failed",
          message: 'Invalid credentials',
          color: 'red',
        });
      } else {
        showNotification({
          id: 'ws-login-success', // Prevent duplicate notifications
          title: "Login Successful",
          message: 'Authenticated via WebSocket',
          color: 'green',
        });
      }
    } catch (error) {
      logger.error("WebSocket login error:", error);
      setWsError("WebSocket login failed");
      showNotification({
        title: "Login Error",
        message: 'WebSocket login failed',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
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
            
            {/* WebSocket Connection Status */}
            <Group position="apart" mb="md">
              <Text size="sm" color="dimmed">Connection Status:</Text>
              <Text 
                size="sm" 
                weight={500} 
                color={isConnected ? "green" : "orange"}
              >
                {connectionStatus}
              </Text>
            </Group>

            <Stack spacing={"md"}>
              {(error || wsError) && !wsAuthenticated && (
                <Alert
                  icon={<IconAlertCircle size={16} />}
                  title="Login error"
                  color="red"
                >
                  {wsError || errorMessages[error] || errorMessages.internalServerError}
                </Alert>
              )}
              
              <form
                onSubmit={form.onSubmit(signMeIn)}
                autoComplete="true"
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
                
                <Group position="apart" mt="lg">
                  <Checkbox 
                    label="Remember me" 
                    sx={{ lineHeight: 1 }} 
                    {...form.getInputProps("rememberMe")} 
                  />
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
                <Button 
                  fullWidth 
                  mt="xl" 
                  type={"submit"}
                  disabled={!isConnected || loading}
                  loading={loading}
                >
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