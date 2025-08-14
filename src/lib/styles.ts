import {
  ButtonStylesParams,
  MantineThemeOverride,
  ModalBodyProps,
  TitleStylesParams,
} from "@mantine/core";

export const fontFamilyMonospace =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace, Monaco, Courier, monospace";
export const fontFamily = "Inter, sans-serif";

const styles: MantineThemeOverride = {
  colors: {
    red: [
      "#ffecee",
      "#f7d9db",
      "#e9b2b5",
      "#db888d",
      "#d0646b",
      "#c94e55",
      "#c74149",
      "#b0333b",
      "#9e2b33",
      "#8c212a",
    ],
  },
  primaryColor: "blue",
  fontFamily,
  fontFamilyMonospace,
  headings: {
    // properties for all headings
    fontWeight: 400,
    fontFamily,

    // properties for individual headings, all of them are optional
    sizes: {
      h1: { fontWeight: 500, fontSize: "32px", lineHeight: 1.4 },
      h2: { fontSize: "28px", lineHeight: 1.5 },
      // ...up to h6
    },
  },
  fontSizes: {
    xs: "10px",
    sm: "12px",
    md: "14px",
    lg: "16px",
    xl: "18px",
    xxl: "20px",
  },
  spacing: {
    xs: "5px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
  },
  focusRingStyles: {
    // reset styles are applied to <button /> and <a /> elements
    // in &:focus:not(:focus-visible) selector to mimic
    // default browser behavior for native <button /> and <a /> elements
    resetStyles: () => ({ outline: "none" }),

    // styles applied to all elements expect inputs based on Input component
    // styled are added with &:focus selector
    styles: (theme) => ({ outline: `2px solid ${theme.colors.blue[7]}` }),

    // focus styles applied to components that are based on Input
    // styled are added with &:focus selector
    inputStyles: (theme) => ({ outline: `2px solid ${theme.colors.blue[7]}` }),
  },
  globalStyles: (theme) => ({
    "*, *::before, *::after": {
      //boxSizing: 'border-box',
    },
    "a, a:link": {
      cursor: "pointer",
    },
    "a:hover": {
      textDecoration: "none",
    },
    ".font-mono": {
      fontFamily: fontFamilyMonospace,
    },
    main: {
      flex: "1",
      display: "flex",
      flexDirection: "column",
    },
    ".no-underline": {
      textDecoration: "none",
      ":hover": {
        textDecoration: "underline",
      },
    },
    ".foreground": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[8]
          : theme.colors.dark[0],
    },

    html: {
      background: "transparent",
    },

    body: {
      userSelect: "none",
      ...theme.fn.fontStyles(),
      background: "transparent",
      /*      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[9]
          : theme.colors.gray[0],*/
      color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
      lineHeight: theme.lineHeight,
    },
  }),

  components: {
    Header: {
      styles: (theme, params: TitleStylesParams) => ({
        root: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.fn.rgba(theme.colors.dark[6], 0.5)
              : theme.fn.rgba(theme.white, 0.2),
          backdropFilter: "blur(5px)",
        },
      }),
    },
    Modal: {
      styles: (theme, params: ModalBodyProps) => ({
        inner: {
          zIndex: 1000,
        },
        overlay: {
          zIndex: 1000,
        },
      }),
    },
    LoadingOverlay: {
      defaultProps: {},
    },
    Title: {
      styles: (theme, params: TitleStylesParams) => ({
        root: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
          fontWeight: 500,
        },
      }),
    },
    Text: {
      styles: (theme, params: ButtonStylesParams, { variant }) =>
        variant === "price"
          ? {
              //  root: {
              //    fontWeight: "bold",
              //  },
            }
          : {},
    },
    SegmentedControl: {
      styles: (theme, params: ButtonStylesParams, { variant }) => ({
        root: {
          borderWidth: 1,
          borderStyle: "solid",
          borderColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[2],
        },
      }),
    },
    Divider: {
      styles: (theme, params: ButtonStylesParams, { variant }) => ({
        root: {
          borderLeftColor:
            theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      }),
    },
    Button: {
      // Subscribe to theme and component params
      styles: (theme, params: ButtonStylesParams, { variant }) => {
        switch (variant) {
          case "subtle":
            return {
              root: {
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.dark[9],
                backgroundColor: "transparent",
                "&:hover, &:active": {
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },
              },
            };
          case "light":
            return {
              root: {
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.dark[9],
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
                "&:hover, &:active": {
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },
              },
            };

          default:
            return {};
        }
      },
    },
    ScrollArea: {
      styles: (theme, params: ButtonStylesParams, { variant }) => ({
        scrollbar: {
          "&:hover .___ref-thumb": {
            background:
              theme.colorScheme === "dark"
                ? theme.colors.dark[5]
                : theme.colors.dark[2],
          },
        },
        thumb: {
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.dark[1],
        },
      }),
    },
    Container: {
      defaultProps: {
        sizes: {
          xs: 540,
          sm: 720,
          md: 1180,
          lg: 1400,
          xl: 1600,
        },
      },
    },
    NumberInput: {
      defaultProps: {
        size: "xs",
      },
    },
  },
};

const mobileStyles = {
  ...styles,

  fontSizes: {
    xs: "14px",
    sm: "16px",
    md: "18px",
    lg: "22px",
    xl: "24px",
  },

  focusRingStyles: {
    // reset styles are applied to <button /> and <a /> elements
    // in &:focus:not(:focus-visible) selector to mimic
    // default browser behavior for native <button /> and <a /> elements
    resetStyles: () => ({ outline: "none" }),
  },

  components: {
    ...styles.components,
    NumberInput: {
      defaultProps: {
        size: "md",
        styles: {
          label: { fontSize: "0.8rem" },
        },
      },
    },
    PasswordInput: {
      defaultProps: {
        size: "lg",
      },
    },
    TextInput: {
      defaultProps: {
        size: "lg",
      },
    },
    Button: {
      defaultProps: {
        size: "lg",
      },
      // Subscribe to theme and component params
      styles: (theme, params: ButtonStylesParams, { variant }) => {
        switch (variant) {
          case "subtle":
            return {
              root: {
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[0]
                    : theme.colors.dark[9],
                backgroundColor: "transparent",
                "&:hover, &:active": {
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },
              },
            };
          case "light":
            return {
              root: {
                color:
                  theme.colorScheme === "dark"
                    ? theme.colors.blue[5]
                    : theme.colors.blue[5],
                background:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[6]
                    : theme.colors.gray[0],
                "&:hover, &:active": {
                  background:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[6]
                      : theme.colors.gray[0],
                },
              },
            };

          default:
            return {};
        }
      },
    },
    NavLink: {
      defaultProps: {
        size: "lg",
      },
      // Subscribe to theme and component params
      styles: (theme, params: ButtonStylesParams, { variant }) => ({
        root: {
          padding: "24px 0",
        },
      }),
    },
    MenuItem: {
      defaultProps: {
        p: "xl",
      },
    },
    ActionIcon: {
      sizes: {
        md: () => ({
          root: {
            width: "52px",
            height: "52px",
          },
        }),
      },
    },
  },
};

export { mobileStyles };
export default styles;
