// src/components/home/SearchBar.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useRouter } from "expo-router";

export default function SearchBar() {
    const { colors } = useTheme();
    const router = useRouter();

    const handlePress = () => {
        router.push('/trip/planner');
    };


    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.background.secondary }]}
            onPress={handlePress}
        >
            <Ionicons name="search" size={20} color={colors.text.secondary} />
            <Text style={[styles.text, { color: colors.text.secondary }]}>
                ¿A dónde vas?
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,

        borderRadius: 8,
        gap: 12
    },
    text: {
        fontSize: 16
    }
});