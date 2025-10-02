import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Theme {
  colors: {
    background: string;
    text: string;
    primary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    secondary: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    success: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    error: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
    white: string;
    gray: {
      50: string;
      100: string;
      200: string;
      300: string;
      400: string;
      500: string;
      600: string;
      700: string;
      800: string;
      900: string;
    };
  };
}

const lightTheme: Theme = {
  colors: {
    background: '#ffffff',
    text: '#000000',
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
};

const darkTheme: Theme = {
  colors: {
    background: '#000000',
    text: '#ffffff',
    primary: {
      50: '#0c4a6e',
      100: '#075985',
      200: '#0369a1',
      300: '#0284c7',
      400: '#0ea5e9',
      500: '#38bdf8',
      600: '#7dd3fc',
      700: '#bae6fd',
      800: '#e0f2fe',
      900: '#f0f9ff',
    },
    secondary: {
      50: '#0c4a6e',
      100: '#075985',
      200: '#0369a1',
      300: '#0284c7',
      400: '#0ea5e9',
      500: '#38bdf8',
      600: '#7dd3fc',
      700: '#bae6fd',
      800: '#e0f2fe',
      900: '#f0f9ff',
    },
    success: {
      50: '#14532d',
      100: '#166534',
      200: '#15803d',
      300: '#16a34a',
      400: '#22c55e',
      500: '#4ade80',
      600: '#86efac',
      700: '#bbf7d0',
      800: '#dcfce7',
      900: '#f0fdf4',
    },
    error: {
      50: '#7f1d1d',
      100: '#991b1b',
      200: '#b91c1c',
      300: '#dc2626',
      400: '#ef4444',
      500: '#f87171',
      600: '#fca5a5',
      700: '#fecaca',
      800: '#fee2e2',
      900: '#fef2f2',
    },
    white: '#ffffff',
    gray: {
      50: '#111827',
      100: '#1f2937',
      200: '#374151',
      300: '#4b5563',
      400: '#6b7280',
      500: '#9ca3af',
      600: '#d1d5db',
      700: '#e5e7eb',
      800: '#f3f4f6',
      900: '#f9fafb',
    },
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const stored = await AsyncStorage.getItem('theme_preference');
      if (stored !== null) {
        setIsDark(stored === 'dark');
      }
    } catch (error) {
      console.error('Erro ao carregar preferência de tema:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    try {
      await AsyncStorage.setItem('theme_preference', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar preferência de tema:', error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
