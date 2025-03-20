// src/components/passenger/RecentTrips.tsx
import React from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { Text, Card, ListItem } from "@/src/components/ui";

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

    if (trips.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text variant="h4" weight="semibold" style={styles.title}>
                Viajes recientes
            </Text>

            {trips.map(trip => (
                <Card
                    key={trip.id}
                    variant="flat"
                    style={styles.tripItem}
                    padding="medium"
                >
                    <ListItem
                        title={trip.name}
                        subtitle={trip.address}
                        leadingIcon="time"
                        dense={false}
                        divider={false}
                    />
                </Card>
            ))}
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
    tripItem: {
        marginVertical: 4,
        borderRadius: 8,
    }
});