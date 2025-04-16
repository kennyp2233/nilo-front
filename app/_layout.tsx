// app/_layout.tsx
import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { Slot } from "expo-router";
import { ToastProvider } from '@/src/components/ui';
import { useEffect } from 'react';
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { useAuthStore } from "@/src/stores/authStore";
import { websocketService } from "@/src/services/core/websocketService";

export default function MainLayout() {
    const { colors } = useTheme();
    const { token, user } = useAuthStore();

    // Inicializar WebSocket cuando el usuario inicia sesión
    useEffect(() => {
        if (token && user) {
            websocketService.initialize(token);
        }

        // Limpiar al cerrar la aplicación
        return () => {
            websocketService.disconnect();
        };
    }, [token, user]);

    return (
        <ThemeProvider>
            <ToastProvider>
                <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
                    <StatusBar style="auto" />
                    <Slot />
                </View>
            </ToastProvider>
        </ThemeProvider>
    );
}