import React, { createContext, useContext, useState } from "react";
import { Theme } from "@radix-ui/themes";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Theme appearance={theme}>{children}</Theme>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
