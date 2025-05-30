import { createContext, useEffect, useState } from "react";
import { getTheme, saveTheme } from "../services/storage";
import darkStyles from "../styles/darkStyles";
import lightStyles from "../styles/lightStyles";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [styles, setStyles] = useState(lightStyles);
  const [isDarkThemeActive, setDarkThemeActive] = useState(false);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getTheme().then((darkMode) => {
      setDarkThemeActive(darkMode);
      if (darkMode) {
        setStyles(darkStyles);
      } else {
        setStyles(lightStyles);
      }
      setLoading(false);
    });
  }, []);

  function toggleTheme() {
    saveTheme(!isDarkThemeActive).then(() => {
      setDarkThemeActive(!isDarkThemeActive);
      if (!isDarkThemeActive) {
        setStyles(darkStyles);
      } else {
        setStyles(lightStyles);
      }
    });
  }

  return (
    <ThemeContext.Provider
      value={{ styles, isLoading, toggleTheme, isDarkThemeActive }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
