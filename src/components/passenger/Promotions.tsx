// src/components/passenger/Promotions.tsx
import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { Text, Card, Badge } from "@/src/components/ui";

type Promotion = {
    id: string;
    title: string;
    description: string;
    type: "discount" | "rewards" | "special";
};

type Props = {
    promotions: Promotion[];
};

export default function Promotions({ promotions }: Props) {
    const { colors } = useTheme();

    const getPromoIcon = (type: Promotion["type"]) => {
        switch (type) {
            case "discount":
                return "pricetag";
            case "rewards":
                return "gift";
            case "special":
                return "star";
            default:
                return "pricetag";
        }
    };

    const getPromoColor = (type: Promotion["type"]): "primary" | "secondary" | "warning" => {
        switch (type) {
            case "discount":
                return "primary";
            case "rewards":
                return "secondary";
            case "special":
                return "warning";
            default:
                return "primary";
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="h4" weight="semibold" style={styles.title}>
                Promociones
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollView}
            >
                {promotions.map(promo => (
                    <Card
                        key={promo.id}
                        variant="default"
                        padding="medium"
                        style={[styles.promoCard]}
                    >
                        <View style={styles.promoContent}>
                            <View style={[
                                styles.iconContainer,
                                { backgroundColor: colors[getPromoColor(promo.type)] }
                            ]}>
                                <Ionicons
                                    name={getPromoIcon(promo.type)}
                                    size={24}
                                    color={colors.background.primary}
                                />
                            </View>

                            <View style={styles.textContainer}>
                                <Text variant="subtitle" weight="semibold">
                                    {promo.title}
                                </Text>
                                <Text variant="body" color="secondary">
                                    {promo.description}
                                </Text>
                            </View>
                        </View>
                    </Card>
                ))}
            </ScrollView>
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
    scrollView: {
        marginHorizontal: -8
    },
    promoCard: {
        width: 300,
        marginHorizontal: 8,
        marginVertical: 4
    },
    promoContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center"
    },
    textContainer: {
        flex: 1,
        gap: 4
    }
});