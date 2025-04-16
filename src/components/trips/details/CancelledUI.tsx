// src/components/trips/details/CancelledUI.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";

interface CancelledUIProps {
    cancellationReason?: string;
    onGoHome: () => void;
}

const CancelledUI: React.FC<CancelledUIProps> = ({
    cancellationReason,
    onGoHome
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <View style={styles.cancelledContainer}>
                <Ionicons name="close-circle" size={60} color={colors.error} />
                <Text style={[styles.cancelledTitle, { color: colors.text.primary }]}>
                    Viaje cancelado
                </Text>
                <Text style={[styles.cancelledMessage, { color: colors.text.secondary }]}>
                    {cancellationReason || "Este viaje ha sido cancelado."}
                </Text>
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
    cancelledContainer: {
        alignItems: "center",
        padding: 20,
    },
    cancelledTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 16,
        marginBottom: 8,
    },
    cancelledMessage: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
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

export default CancelledUI;