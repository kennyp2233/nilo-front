import { ThemeProvider, useTheme } from "@/src/theme/ThemeContext";
import { Slot } from "expo-router";

import { ReactNode } from 'react';
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

export default function MainLayout() {
    const { colors } = useTheme();
    return (

        <ThemeProvider>
            <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
                <Slot />
            </View>

        </ThemeProvider>
    );
}