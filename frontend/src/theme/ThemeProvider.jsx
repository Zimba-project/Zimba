import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themeVars } from "./themeVars";

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("theme");
      if (saved) setTheme(saved);
    })();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme);
  };

  const buildRgb = (val) => {
    const parts = String(val).trim().split(/\s+/);
    return parts.length === 3 ? `rgb(${parts.join(",")})` : val;
  };

  const vars = themeVars[theme];
  const colors = {
    primary: buildRgb(vars["--color-primary"]),
    secondary: buildRgb(vars["--color-secondary"]),
    success: buildRgb(vars["--color-success"]),
    info: buildRgb(vars["--color-info"]),
    warning: buildRgb(vars["--color-warning"]),
    background: buildRgb(vars["--color-background"]),
    text: buildRgb(vars["--color-text"]),
    surface: buildRgb(vars["--color-surface"]),
    border: buildRgb(vars["--color-border"]),
    muted: buildRgb(vars["--color-muted"]),
    onPrimary: buildRgb(vars["--color-on-primary"]),
    danger: buildRgb(vars["--color-danger"]),
    overlay: buildRgb(vars["--color-overlay"]),
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === "dark", colors }}>
      {children}
    </ThemeContext.Provider>
  );
}
