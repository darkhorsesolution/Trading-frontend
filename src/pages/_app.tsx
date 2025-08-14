import React, { useEffect, useState } from "react";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer, { RootState } from "../store";
import {
  Provider,
  TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { useLocalStorage } from "@mantine/hooks";
import {
  ColorScheme,
  ColorSchemeProvider,
  LoadingOverlay,
  MantineProvider,
} from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { api } from "@/store/api";
import "@/styles/_app.scss";
import { useRouter } from "next/router";
import LocalStorageService from "@/services/LocalStorageService";
import { Device, useDevice } from "@/services/UseDevice";
import styles, { mobileStyles } from "@/lib/styles";
import {
  TableWidgetSettingsModal,
  WidgetSettingsModal,
  Modals,
  ConfirmModal,
  NewsModal,
} from "@/components/Modals";
import OneSignal from "react-onesignal";
import getConfig from "next/config";
import { VersionProvider } from "@/lib/version";
import Head from 'next/head'
import { WebSocketProvider } from "@/contexts/WebSocketContext";

const blockUpdatesMiddleware = (store) => (next) => (action) => {
  if (store.getState().disableUpdates && action.type !== "ALLOWED_ACTION") {
    return;
  }

  return next(action);
};
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    // disable this line to reduce logs...
    //mws.push(logger);

    return getDefaultMiddleware({
      serializableCheck: false,
    }).concat([api.middleware, blockUpdatesMiddleware]);
  },
});

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

function SafeHydrate({ children }) {
  return <div suppressHydrationWarning>{children}</div>;
}

function App({ Component, pageProps }) {
  const router = useRouter();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "dark",
    getInitialValueInEffect: true,
  });

  useEffect(() => {
    if (!LocalStorageService.IsDesktopVersionSet()) {
      LocalStorageService.setIsDesktopVersion(router.query["desktop"] === "1");
    }
  }, []);

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));
  const getLayout = Component.getLayout || ((page) => page);

  const device = useDevice();

  return (
    <SafeHydrate>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Provider store={store}>
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            theme={{
              colorScheme,
              ...(device === Device.Mobile ? mobileStyles : styles),
            }}
            withCSSVariables
            withGlobalStyles
            withNormalizeCSS
          >
            <VersionProvider version={"0.1.0"}>
              <ModalsProvider
                labels={{ confirm: "Submit", cancel: "Cancel" }}
                modals={{
                  [Modals.TableWidgetSettingsModal]: TableWidgetSettingsModal,
                  [Modals.WidgetSettingsModal]: WidgetSettingsModal,
                  [Modals.ConfirmModal]: ConfirmModal,
                  [Modals.NewsModal]: NewsModal,
                }}
              >
                <Notifications limit={10} autoClose={3000} />

                <SessionProvider session={pageProps.session} refetchInterval={10}>
                  <WebSocketProvider>
                    {Component.auth ? (
                      <Auth>
                        {getLayout(
                          <Component key={router.asPath} {...pageProps} />
                        )}
                      </Auth>
                    ) : (
                      getLayout(<Component key={router.asPath} {...pageProps} />)
                    )}
                  </WebSocketProvider>
                </SessionProvider>
              </ModalsProvider>
            </VersionProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </Provider>
    </SafeHydrate>
  );
}

function Auth({ children }) {
  const { data, status } = useSession();
  const [onesignalInited, setOnesignalInited] = useState(false);

  const isUser = !!data;
  React.useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    if (!isUser) {
      signIn(); // If not authenticated, force log in
    }
  }, [isUser, status]);
  useEffect(() => {
    if (onesignalInited || !data?.user?.account) {
      return;
    }
    OneSignal.init({
      appId: "c47f64e7-c9cc-4793-bead-330ecc193180",
      autoResubscribe: true,
      notificationClickHandlerMatch: "origin",
      notificationClickHandlerAction: "focus",
      notifyButton: {
        enable: false,
      },
      allowLocalhostAsSecureOrigin: true,
    }).then(() => {
      setOnesignalInited(true);
      OneSignal.Slidedown.promptPush();
      OneSignal.User.addAlias("account", data.user.account);
      OneSignal.Notifications.addEventListener("click", () => { });
    });
  }, [data, onesignalInited]);

  if (isUser) {
    return React.cloneElement(children, {
      session: data,
      appVersion: getConfig().serverRuntimeConfig.appVersion,
    });
  }
  return <LoadingOverlay visible={true} overlayBlur={2} />;
}

export default App;
