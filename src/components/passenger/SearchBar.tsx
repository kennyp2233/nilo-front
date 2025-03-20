// src/components/passenger/SearchBar.tsx
import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import { Text, Input } from "@/src/components/ui";

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
            activeOpacity={0.7}
        >
            <View style={styles.searchContent}>
                <Ionicons name="search" size={20} color={colors.text.secondary} />
                <Text
                    variant="body"
                    color="secondary"
                    style={styles.text}
                >
                    ¿A dónde vas?
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 8,
    },
    searchContent: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        gap: 12
    },
    text: {
        fontSize: 16
    }
});