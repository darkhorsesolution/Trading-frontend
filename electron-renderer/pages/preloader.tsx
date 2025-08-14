import React from "react";
import {
  ActionIcon,
  AppShell,
  Box,
  Button,
  ColorScheme,
  ColorSchemeProvider,
  Flex,
  LoadingOverlay,
  MantineProvider,
  Stack,
  createStyles,
} from "@mantine/core";
import { IconDoorExit, IconMaximize, IconMinimize } from "@tabler/icons";
import "@/styles/_app.scss";

const useStyles = createStyles((theme) => ({
  toolbar: {
    textAlign: "right",
    WebkitAppRegion: "drag",
    display: "flex",
    justifyContent: "flex-end",
    "*": {
      WebkitAppRegion: "none",
    },
  },
}));

function App({ Component, pageProps }) {
  const { classes } = useStyles();

  return (
    <MantineProvider
      withCSSVariables
      withGlobalStyles
      withNormalizeCSS
      theme={{
        colorScheme: "dark",
      }}
    >
      <AppShell
        className={"dark"}
        padding={0}
        style={{
          maxHeight: "100vh",
        }}
        styles={(theme) => ({
          main: {
            backgroundColor: theme.black,
          },
        })}
      >
        <Flex direction={"column"} h={"100vh"}>
          <Box pos={"relative"} style={{ flex: "1" }}>
            <LoadingOverlay visible={true} />
          </Box>
        </Flex>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
