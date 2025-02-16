// src/theme/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Definición de tipos
export type ThemeColors = {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
    };
    border: string;
};

type ThemeContextType = {
    isDark: boolean;
    colors: ThemeColors;
    toggleTheme: () => void;
};

const theme = {
    light: {
        primary: '#007AFF',       // Azul NILO
        secondary: '#5856D6',     // Púrpura para acentos
        success: '#34C759',       // Verde para éxito
        warning: '#FF9500',       // Naranja para advertencias
        error: '#FF3B30',         // Rojo para errores
        background: {
            primary: '#FFFFFF',     // Fondo principal
            secondary: '#F2F2F7',   // Fondo secundario
            tertiary: '#E5E5EA'     // Fondo terciario
        },
        text: {
            primary: '#000000',     // Texto principal
            secondary: '#3C3C43',   // Texto secundario
            tertiary: '#787880'     // Texto terciario
        },
        border: '#C6C6C8'         // Bordes
    },
    dark: {
        primary: '#0A84FF',       // Azul NILO
        secondary: '#5E5CE6',     // Púrpura para acentos
        success: '#30D158',       // Verde para éxito
        warning: '#FFD60A',       // Naranja para advertencias
        error: '#FF453A',         // Rojo para errores
        background: {
            primary: '#000000',     // Fondo principal
            secondary: '#1C1C1E',   // Fondo secundario
            tertiary: '#2C2C2E'     // Fondo terciario
        },
        text: {
            primary: '#FFFFFF',     // Texto principal
            secondary: '#EBEBF5',   // Texto secundario
            tertiary: '#8E8E93'     // Texto terciario
        },
        border: '#38383A'         // Bordes
    }
};

// Crear el contexto
const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    colors: theme.light,
    toggleTheme: () => { },
});

// Provider del tema
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    // Efecto para sincronizar con el tema del sistema
    useEffect(() => {
        setIsDark(systemColorScheme === 'dark');
    }, [systemColorScheme]);

    const toggleTheme = () => setIsDark(!isDark);
    const colors = isDark ? theme.dark : theme.light;

    return (
        <ThemeContext.Provider value= {{ isDark, colors, toggleTheme }
}>
    { children }
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};