import Theme from "../interfaces/theme";
import React, { createContext, useEffect, useState } from "react";
import { useAppSelector } from "@/pages/_app";
import { accountSelector } from "@/store/account";

const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined" && window.localStorage) {
    // load previously set from local storage
    const preferences = window.localStorage.getItem("theme");
    if (
      preferences &&
      (preferences === Theme.Dark || preferences === Theme.Light)
    ) {
      return preferences;
    }

    const userMedia = window.matchMedia("(prefers-color-scheme: dark)");
    if (userMedia.matches) {
      return Theme.Dark;
    }
  }

  return Theme.Light;
};

function setAppTheme(theme: Theme): void {
  const root = window.document.documentElement;
  const isDark = theme === Theme.Dark;

  root.classList.remove(isDark ? Theme.Light : Theme.Dark);
  root.classList.add(theme);

  localStorage.setItem("theme", theme);
}

export const ThemeContext = createContext({
  theme: Theme.Light,
  setTheme: (theme: Theme) => setAppTheme(theme),
});

export type ThemeProviderProps = {
  initialTheme?: Theme;
  children: any;
};

export const ThemeProvider = ({
  initialTheme,
  children,
}: ThemeProviderProps) => {
  const [theme, setTheme] = useState(Theme.Light);

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    if (initialTheme) {
      setAppTheme(initialTheme);
    }
  }, [initialTheme]);

  useEffect(() => {
    setAppTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
