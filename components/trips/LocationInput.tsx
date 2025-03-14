// components/LocationInput.tsx
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface LocationInputProps {
    type: "origin" | "destination";
    label: string;
    displayName?: string; // Add displayName as separate prop
    onPress: () => void;
    dotColor: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, displayName, onPress, dotColor }) => {
    const { colors } = useTheme();
    return (
        <Pressable
            style={[styles.locationInput, { backgroundColor: colors.background.secondary }]}
            onPress={onPress}
        >
            <View style={styles.locationIcon}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.locationLabel, { color: colors.text.primary }]}>{label}</Text>
                {displayName && (
                    <Text style={[styles.locationAddress, { color: colors.text.secondary }]} numberOfLines={1}>
                        {displayName}
                    </Text>
                )}
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    locationInput: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
    },
    locationIcon: {
        marginRight: 12,
        width: 24,
        height: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    textContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 16,
        fontWeight: "500",
    },
    locationAddress: {
        fontSize: 12,
        marginTop: 2,
    },
});

export default LocationInput;