// src/components/home/Promotions.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

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

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Promociones
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
                {promotions.map(promo => (
                    <TouchableOpacity
                        key={promo.id}
                        style={[
                            styles.promoCard,
                            { backgroundColor: colors.background.secondary }
                        ]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <Ionicons
                                name={getPromoIcon(promo.type)}
                                size={24}
                                color={colors.background.primary}
                            />
                        </View>
                        <View style={styles.promoContent}>
                            <Text style={[styles.promoTitle, { color: colors.text.primary }]}>
                                {promo.title}
                            </Text>
                            <Text style={[styles.promoDescription, { color: colors.text.secondary }]}>
                                {promo.description}
                            </Text>
                        </View>
                    </TouchableOpacity>
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
        fontSize: 20,
        fontWeight: "600"
    },
    scrollView: {
        marginHorizontal: -16
    },
    promoCard: {
        flexDirection: "row",
        marginHorizontal: 8,
        padding: 16,
        borderRadius: 8,
        width: 300,
        gap: 16,
        alignItems: "center"
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center"
    },
    promoContent: {
        flex: 1,
        gap: 4
    },
    promoTitle: {
        fontSize: 16,
        fontWeight: "500"
    },
    promoDescription: {
        fontSize: 14
    }
});