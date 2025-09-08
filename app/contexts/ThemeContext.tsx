import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    // adicione outras cores conforme necessário
  };
}

const lightTheme: Theme = {
  colors: {
    primary: '#0ea5e9',
    background: '#ffffff',
    text: '#000000',
  },
};

const darkTheme: Theme = {
  colors: {
    primary: '#0ea5e9',
    background: '#000000',
    text: '#ffffff',
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};