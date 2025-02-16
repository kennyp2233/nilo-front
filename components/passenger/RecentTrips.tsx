// src/components/home/RecentTrips.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";

type Trip = {
    id: string;
    name: string;
    address: string;
    frequency: string;
};

type Props = {
    trips: Trip[];
};

export default function RecentTrips({ trips }: Props) {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Viajes recientes
            </Text>
            {trips.map(trip => (
                <View
                    key={trip.id}
                    style={[styles.tripItem, { backgroundColor: colors.background.secondary }]}
                >
                    <Ionicons name="time" size={24} color={colors.text.secondary} />
                    <View style={styles.tripInfo}>
                        <Text style={[styles.tripName, { color: colors.text.primary }]}>
                            {trip.name}
                        </Text>
                        <Text style={[styles.tripAddress, { color: colors.text.secondary }]}>
                            {trip.address}
                        </Text>
                        <Text style={[styles.tripFrequency, { color: colors.text.tertiary }]}>
                            {trip.frequency}
                        </Text>
                    </View>
                </View>
            ))}
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
    tripItem: {
        flexDirection: "row",
        padding: 16,
        borderRadius: 8,
        gap: 16,
        alignItems: "center"
    },
    tripInfo: {
        gap: 4
    },
    tripName: {
        fontSize: 16,
        fontWeight: "500"
    },
    tripAddress: {
        fontSize: 14
    },
    tripFrequency: {
        fontSize: 12
    }
});