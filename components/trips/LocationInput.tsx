// components/LocationInput.tsx
import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";

interface LocationInputProps {
    type: "origin" | "destination";
    label: string;
    onPress: () => void;
    dotColor: string;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, onPress, dotColor }) => {
    const { colors } = useTheme();
    return (
        <Pressable
            style={[styles.locationInput, { backgroundColor: colors.background.secondary }]}
            onPress={onPress}
        >
            <View style={styles.locationIcon}>
                <View style={[styles.dot, { backgroundColor: dotColor }]} />
            </View>
            <Text style={{ color: colors.text.primary }}>{label}</Text>
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
});

export default LocationInput;
