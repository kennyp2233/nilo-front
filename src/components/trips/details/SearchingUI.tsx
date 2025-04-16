// src/components/trips/details/SearchingUI.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { Alert } from 'react-native';

interface SearchingUIProps {
    searchTimeElapsed: number;
    wsConnected: boolean;
    onCancel: (reason?: string) => Promise<void>;
}

const SearchingUI: React.FC<SearchingUIProps> = ({
    searchTimeElapsed,
    wsConnected,
    onCancel
}) => {
    const { colors } = useTheme();
    const [searchingMessages, setSearchingMessages] = useState<string[]>([
        "Buscando conductores cercanos...",
    ]);

    // Format time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Calculate remaining time
    const getTimeRemaining = () => {
        return Math.max(0, 120 - searchTimeElapsed);
    };

    // Handle cancel
    const handleCancel = () => {
        Alert.alert(
            "¿Cancelar búsqueda?",
            "¿Estás seguro de que deseas cancelar la búsqueda?",
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: () => onCancel("Usuario canceló la búsqueda"),
                },
            ]
        );
    };

    // Update search messages based on elapsed time
    useEffect(() => {
        if (searchTimeElapsed >= 10 && searchTimeElapsed < 20 && searchingMessages.length === 1) {
            setSearchingMessages(prev => [...prev, "Varios conductores están cerca..."]);
        } else if (searchTimeElapsed >= 20 && searchTimeElapsed < 40 && searchingMessages.length === 2) {
            setSearchingMessages(prev => [...prev, "Conectando con el mejor conductor para ti..."]);
        } else if (searchTimeElapsed >= 40 && searchingMessages.length === 3) {
            setSearchingMessages(prev => [...prev, "La búsqueda está tomando más tiempo de lo habitual..."]);
        }
    }, [searchTimeElapsed]);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background.primary }]}
            contentContainerStyle={styles.contentContainer}
        >
            <View style={styles.statusContainer}>
                <Text style={[styles.statusTitle, { color: colors.text.primary }]}>
                    Buscando tu NILO
                </Text>

                <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                    <Text style={[styles.timeText, { color: colors.text.secondary }]}>
                        Tiempo de búsqueda: {formatTime(searchTimeElapsed)}
                    </Text>
                </View>

                <View style={styles.timeRemainingContainer}>
                    <Text style={[styles.estimatedTime, { color: colors.text.primary }]}>
                        Tiempo estimado de espera: {formatTime(getTimeRemaining())}
                    </Text>
                    {!wsConnected && (
                        <View style={styles.offlineIndicator}>
                            <Ionicons name="cloud-offline" size={14} color={colors.warning} />
                            <Text style={[styles.offlineText, { color: colors.warning }]}>
                                Sin conexión en tiempo real
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.messagesContainer}>
                    {searchingMessages.map((message, index) => (
                        <View
                            key={index}
                            style={[
                                styles.messageItem,
                                { backgroundColor: colors.background.secondary }
                            ]}
                        >
                            <Text style={{ color: colors.text.primary }}>{message}</Text>
                            {index === searchingMessages.length - 1 && (
                                <ActivityIndicator size="small" color={colors.primary} style={styles.messageIndicator} />
                            )}
                        </View>
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.error }]}
                    onPress={handleCancel}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                        Cancelar búsqueda
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
        paddingBottom: 40,
    },
    statusContainer: {
        padding: 10,
    },
    statusTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    timeContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 8,
    },
    timeText: {
        fontSize: 16,
        marginLeft: 6,
    },
    timeRemainingContainer: {
        alignItems: "center",
        marginBottom: 16,
    },
    estimatedTime: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 4,
    },
    offlineIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    offlineText: {
        fontSize: 12,
        marginLeft: 4,
    },
    messagesContainer: {
        marginBottom: 24,
    },
    messageItem: {
        padding: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    messageIndicator: {
        marginLeft: 8,
    },
    cancelButton: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 14,
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

export default SearchingUI;