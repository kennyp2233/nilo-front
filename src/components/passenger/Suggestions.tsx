// src/components/passenger/Suggestions.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { Text, Card, Badge } from "@/src/components/ui";

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
            <Text variant="h4" weight="semibold" style={styles.title}>
                Sugerencias
            </Text>

            <View style={styles.grid}>
                {suggestions.map(suggestion => (
                    <Card
                        key={suggestion.id}
                        variant="default"
                        padding="medium"
                        style={styles.suggestionItem}
                    >
                        <View style={styles.suggestionContent}>
                            <Text
                                variant="subtitle"
                                weight="semibold"
                                style={styles.suggestionTitle}
                            >
                                {suggestion.title}
                            </Text>

                            <View style={styles.suggestionDetails}>
                                <View style={styles.distance}>
                                    <Ionicons
                                        name="location"
                                        size={14}
                                        color={colors.text.secondary}
                                    />
                                    <Text variant="caption" color="secondary">
                                        {suggestion.distance}
                                    </Text>
                                </View>

                                <View style={styles.rating}>
                                    <Ionicons
                                        name="star"
                                        size={14}
                                        color={colors.warning}
                                    />
                                    <Text variant="caption" color="secondary">
                                        {suggestion.rating}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </Card>
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
        marginBottom: 8
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12
    },
    suggestionItem: {
        flex: 1,
        minWidth: "45%",
    },
    suggestionContent: {
        gap: 8
    },
    suggestionTitle: {
        fontSize: 16,
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
    rating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    }
});