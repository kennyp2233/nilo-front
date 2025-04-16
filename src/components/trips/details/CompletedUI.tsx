// src/components/trips/details/CompletedUI.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface CompletedUIProps {
    tripId?: string;
    onGoToRating: () => void;
    onGoHome: () => void;
}

const CompletedUI: React.FC<CompletedUIProps> = ({
    tripId,
    onGoToRating,
    onGoHome
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <View style={styles.completedContainer}>
                <Ionicons name="checkmark-circle" size={60} color={colors.success} />
                <Text style={[styles.completedTitle, { color: colors.text.primary }]}>
                    ¡Viaje completado!
                </Text>
                <Text style={[styles.completedMessage, { color: colors.text.secondary }]}>
                    Has llegado a tu destino. Gracias por viajar con NILO.
                </Text>
                <TouchableOpacity
                    style={[styles.completeButton, { backgroundColor: colors.primary }]}
                    onPress={onGoToRating}
                >
                    <Text style={[styles.completeButtonText, { color: "white" }]}>
                        Calificar viaje
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.homeButton, { borderColor: colors.primary }]}
                    onPress={onGoHome}
                >
                    <Text style={[styles.homeButtonText, { color: colors.primary }]}>
                        Volver al inicio
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    completedContainer: {
        alignItems: "center",
        padding: 20,
    },
    completedTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 16,
        marginBottom: 8,
    },
    completedMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
    },
    completeButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 16,
        width: "100%",
    },
    completeButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    homeButton: {
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        width: "100%",
    },
    homeButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
});

export default CompletedUI;