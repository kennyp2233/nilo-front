// src/components/trips/details/ErrorState.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface ErrorStateProps {
    onGoBack: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ onGoBack }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.errorContainer, { backgroundColor: colors.background.primary }]}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.text.primary }]}>
                No se encontró información del viaje
            </Text>
            <TouchableOpacity
                style={[styles.backButton, { backgroundColor: colors.primary }]}
                onPress={onGoBack}
            >
                <Text style={styles.backButtonText}>Volver al inicio</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
});

export default ErrorState;