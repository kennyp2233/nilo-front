// src/components/trips/details/ActiveRideUI.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { Trip } from "@/src/stores/tripStore";

interface ActiveRideUIProps {
    trip: Trip;
    estimatedArrival: number;
    onCancel: (reason?: string) => Promise<void>;
}

const ActiveRideUI: React.FC<ActiveRideUIProps> = ({ trip, estimatedArrival, onCancel }) => {
    const { colors } = useTheme();

    // Contact driver
    const handleContactDriver = () => {
        if (!trip.driver) {
            Alert.alert("Error", "No hay conductor asignado aún");
            return;
        }

        Alert.alert(
            "Contactar al conductor",
            "¿Cómo deseas contactar a tu conductor?",
            [
                {
                    text: "Llamar",
                    onPress: () => console.log("Llamando al conductor"),
                },
                {
                    text: "Mensaje",
                    onPress: () => console.log("Mensaje al conductor"),
                },
                {
                    text: "Cancelar",
                    style: "cancel",
                },
            ]
        );
    };

    // Handle cancel
    const handleCancel = () => {
        Alert.alert(
            "¿Cancelar viaje?",
            "¿Estás seguro de que deseas cancelar este viaje?",
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Sí, cancelar",
                    style: "destructive",
                    onPress: () => onCancel("Usuario canceló el viaje"),
                },
            ]
        );
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background.primary }]}
            contentContainerStyle={styles.contentContainer}
        >
            {/* Driver info */}
            <View style={styles.driverContainer}>
                {/* Driver photo and rating */}
                <View style={styles.driverInfo}>
                    <Image
                        source={{ uri: trip.driver?.photo || "https://placehold.co/200" }}
                        style={styles.driverPhoto}
                        defaultSource={require('@/assets/images/icon.png')} // Fallback to app icon
                    />

                    <View style={styles.driverDetails}>
                        <Text style={[styles.driverName, { color: colors.text.primary }]}>
                            {trip.driver?.name || "Carlos Mendoza"}
                        </Text>

                        <View style={styles.ratingContainer}>
                            <Ionicons name="star" size={16} color={colors.warning} />
                            <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                                {trip.driver?.rating || "4.8"} • {trip.driver?.trips || "328"} viajes
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.contactIcon} onPress={handleContactDriver}>
                        <Ionicons name="call" size={22} color={colors.primary} />
                    </TouchableOpacity>
                </View>

                {/* Vehicle info */}
                <View style={[styles.vehicleContainer, { borderTopColor: colors.border }]}>
                    <View style={styles.vehicleHeader}>
                        <Text style={[styles.vehicleTitle, { color: colors.text.secondary }]}>
                            Vehículo
                        </Text>
                        <View style={[styles.plate, { backgroundColor: colors.background.secondary }]}>
                            <Text style={[styles.plateText, { color: colors.text.primary }]}>
                                {trip.driver?.vehicle?.plate || "ABC-1234"}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.vehicleDetails, { color: colors.text.primary }]}>
                        {trip.driver?.vehicle?.make || "Toyota"} {trip.driver?.vehicle?.model || "Corolla"} • {trip.driver?.vehicle?.year || "2020"} • {trip.driver?.vehicle?.color || "Blanco"}
                    </Text>
                </View>
            </View>

            {/* Trip details */}
            <View style={[styles.tripDetails, { backgroundColor: colors.background.secondary }]}>
                <View style={styles.locationItem}>
                    <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                    <View style={styles.locationText}>
                        <Text style={[styles.locationType, { color: colors.text.secondary }]}>
                            Origen
                        </Text>
                        <Text style={[styles.locationAddress, { color: colors.text.primary }]} numberOfLines={1}>
                            {trip?.startLocation?.name || "Ubicación de origen"}
                        </Text>
                    </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.locationItem}>
                    <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
                    <View style={styles.locationText}>
                        <Text style={[styles.locationType, { color: colors.text.secondary }]}>
                            Destino
                        </Text>
                        <Text style={[styles.locationAddress, { color: colors.text.primary }]} numberOfLines={1}>
                            {trip?.endLocation?.name || "Ubicación de destino"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Status-specific messages and actions */}
            <View style={styles.statusMessageContainer}>
                {trip.status === "CONFIRMED" && (
                    <>
                        <Text style={[styles.statusMessage, { color: colors.text.primary }]}>
                            Tu conductor está en camino. Por favor espera en el punto de recogida.
                        </Text>
                        <View style={styles.actionButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.background.secondary }]}
                                onPress={handleContactDriver}
                            >
                                <Ionicons name="call-outline" size={20} color={colors.primary} />
                                <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>
                                    Contactar
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: colors.background.secondary }]}
                                onPress={handleCancel}
                            >
                                <Ionicons name="close-outline" size={20} color={colors.error} />
                                <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>
                                    Cancelar
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}

                {trip.status === "IN_PROGRESS" && (
                    <>
                        <Text style={[styles.statusMessage, { color: colors.text.primary }]}>
                            Disfruta tu viaje. Estás en camino a tu destino.
                        </Text>
                        <TouchableOpacity
                            style={[styles.contactButton, { backgroundColor: colors.primary }]}
                            onPress={handleContactDriver}
                        >
                            <Ionicons name="chatbubbles-outline" size={20} color="white" />
                            <Text style={[styles.contactButtonText, { color: "white" }]}>
                                Contactar al conductor
                            </Text>
                        </TouchableOpacity>
                    </>
                )}
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
    driverContainer: {
        paddingVertical: 16,
    },
    driverInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    driverPhoto: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#e1e1e1",
    },
    driverDetails: {
        marginLeft: 12,
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    ratingText: {
        marginLeft: 4,
        fontSize: 14,
    },
    contactIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e1e1e1",
    },
    vehicleContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
    },
    vehicleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    vehicleTitle: {
        fontSize: 14,
    },
    plate: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    plateText: {
        fontSize: 14,
        fontWeight: "500",
    },
    vehicleDetails: {
        fontSize: 16,
    },
    tripDetails: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    locationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    locationText: {
        flex: 1,
    },
    locationType: {
        fontSize: 12,
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: 16,
    },
    divider: {
        height: 1,
        marginVertical: 12,
        marginLeft: 6,
    },
    statusMessageContainer: {
        marginBottom: 16,
    },
    statusMessage: {
        fontSize: 16,
        marginBottom: 16,
        textAlign: "center",
    },
    contactButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    contactButtonText: {
        fontSize: 16,
        fontWeight: "500",
    },
    actionButtonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

export default ActiveRideUI;