// src/components/home/Suggestions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

type Suggestion = {
    id: string;
    title: string;
    distance: string;
    rating: number;
};

type Props = {
    suggestions: Suggestion[];
};

export default function Suggestions({ suggestions }: Props) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Sugerencias
            </Text>
            <View style={styles.grid}>
                {suggestions.map(suggestion => (
                    <TouchableOpacity
                        key={suggestion.id}
                        style={[
                            styles.suggestionItem,
                            { backgroundColor: colors.background.secondary }
                        ]}
                    >
                        <View style={styles.suggestionContent}>
                            <Text style={[styles.suggestionTitle, { color: colors.text.primary }]}>
                                {suggestion.title}
                            </Text>
                            <View style={styles.suggestionDetails}>
                                <View style={styles.distance}>
                                    <Ionicons name="location" size={14} color={colors.text.secondary} />
                                    <Text style={[styles.distanceText, { color: colors.text.secondary }]}>
                                        {suggestion.distance}
                                    </Text>
                                </View>
                                <View style={styles.rating}>
                                    <Ionicons name="star" size={14} color={colors.warning} />
                                    <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                                        {suggestion.rating}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12
    },
    title: {
        fontSize: 20,
        fontWeight: "600"
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12
    },
    suggestionItem: {
        flex: 1,
        minWidth: "45%",
        borderRadius: 8,
        padding: 16
    },
    suggestionContent: {
        gap: 8
    },
    suggestionTitle: {
        fontSize: 16,
        fontWeight: "500"
    },
    suggestionDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    distance: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    distanceText: {
        fontSize: 12
    },
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    ratingText: {
        fontSize: 12
    }
});