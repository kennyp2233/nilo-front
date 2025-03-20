// app/trip/details.tsx
import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    Dimensions,
    Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useTrip } from "@/src/hooks/useTrip";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Trip status types
type TripStatus =
    | "SEARCHING"   // Buscando conductor
    | "CONFIRMED"   // Conductor encontrado, en camino
    | "ARRIVED"     // Conductor llegó al origen
    | "IN_PROGRESS" // Viaje en progreso
    | "COMPLETED"   // Viaje finalizado
    | "CANCELLED";  // Viaje cancelado

export default function TripDetailsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const {
        fetchTripDetails,
        activeTrip,
        updateTripStatus,
        isLoading,
        route,
        error
    } = useTrip(tripId);

    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [estimatedArrival, setEstimatedArrival] = useState<number>(5);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [searchingMessages, setSearchingMessages] = useState<string[]>([
        "Buscando conductores cercanos...",
    ]);

    // Poll for trip updates every 5 seconds
    useEffect(() => {
        if (tripId) {
            fetchTripDetails(tripId);

            // Set up polling for updates
            const pollInterval = setInterval(() => {
                fetchTripDetails(tripId);
            }, 5000);

            return () => clearInterval(pollInterval);
        }
    }, [tripId]);

    // Pulse animation for the searching indicator
    useEffect(() => {
        if (activeTrip?.status === "SEARCHING") {
            const pulse = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                    }),
                ])
            );

            pulse.start();

            return () => {
                pulse.stop();
            };
        }
    }, [activeTrip?.status]);

    // Update elapsed time
    useEffect(() => {
        if (activeTrip && ["SEARCHING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"].includes(activeTrip.status)) {
            const timer = setInterval(() => {
                setElapsedTime(prev => prev + 1);

                // Add searching messages at specific intervals
                if (activeTrip.status === "SEARCHING") {
                    if (elapsedTime === 10 && searchingMessages.length === 1) {
                        setSearchingMessages(prev => [...prev, "Varios conductores están cerca..."]);
                        setEstimatedArrival(3);
                    } else if (elapsedTime === 20 && searchingMessages.length === 2) {
                        setSearchingMessages(prev => [...prev, "Conectando con el mejor conductor para ti..."]);
                        setEstimatedArrival(2);
                    }
                }

                // Update estimated arrival time
                if (activeTrip.status === "CONFIRMED" && elapsedTime % 30 === 0) {
                    setEstimatedArrival(prev => Math.max(1, prev - 1));
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [activeTrip?.status, elapsedTime]);

    // Error handling
    useEffect(() => {
        if (error) {
            Alert.alert("Error", error);
        }
    }, [error]);

    // Handle cancel button
    const handleCancelTrip = () => {
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
                    onPress: async () => {
                        if (tripId) {
                            const reason = activeTrip?.status === "SEARCHING"
                                ? "Usuario canceló la búsqueda"
                                : "Usuario canceló el viaje";

                            const success = await updateTripStatus(tripId, "CANCELLED", reason);
                            if (success) {
                                router.replace("/passenger");
                            }
                        }
                    },
                },
            ]
        );
    };

    // Contact driver
    const handleContactDriver = () => {
        if (!activeTrip?.driver) {
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

    // Handle trip completion and rating
    const handleTripComplete = async () => {
        if (tripId) {
            router.replace(`/trip/summary?tripId=${tripId}`);
        }
    };

    if (!activeTrip && isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text.primary }]}>
                    Cargando detalles del viaje...
                </Text>
            </View>
        );
    }

    if (!activeTrip) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={[styles.loadingText, { color: colors.text.primary }]}>
                    No se encontró información del viaje
                </Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.replace("/passenger")}
                >
                    <Text style={styles.backButtonText}>Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Mock driver data for demo (in real app, this would come from the API)
    const driverData = activeTrip.driver || {
        id: "driver123",
        name: "Carlos Mendoza",
        rating: 4.8,
        trips: 328,
        phone: "+593987654321",
        photo: "https://placehold.co/200",
        vehicle: {
            make: "Toyota",
            model: "Corolla",
            year: 2020,
            color: "Blanco",
            plate: "ABC-1234"
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Get status text based on current status
    const getStatusText = () => {
        switch (activeTrip.status) {
            case "SEARCHING":
                return "Buscando tu NILO";
            case "CONFIRMED":
                return `Tu conductor llegará en ${estimatedArrival} min`;

            case "IN_PROGRESS":
                return "En viaje";
            case "COMPLETED":
                return "Viaje completado";
            case "CANCELLED":
                return "Viaje cancelado";
            default:
                return "Preparando tu viaje";
        }
    };

    // Get color based on trip status
    const getStatusColor = () => {
        switch (activeTrip.status) {
            case "SEARCHING":
                return colors.primary;

            case "IN_PROGRESS":
                return colors.primary;
            case "COMPLETED":
                return colors.success;
            case "CANCELLED":
                return colors.error;
            default:
                return colors.primary;
        }
    };

    // Get route coordinates
    const getRouteCoordinates = () => {
        if (activeTrip?.startLocation && activeTrip?.endLocation) {
            // If we have real route data
            if (route && route.features && route.features[0] && route.features[0].geometry) {
                return route.features[0].geometry.coordinates.map((coord: any[]) => ({
                    latitude: coord[1],
                    longitude: coord[0]
                }));
            }

            // Fallback: just use start and end
            return [
                {
                    latitude: activeTrip.startLocation.latitude,
                    longitude: activeTrip.startLocation.longitude
                },
                {
                    latitude: activeTrip.endLocation.latitude,
                    longitude: activeTrip.endLocation.longitude
                }
            ];
        }
        return [];
    };

    // Render different UI components based on trip status
    const renderStatusSpecificUI = () => {
        switch (activeTrip.status) {
            case "SEARCHING":
                return renderSearchingUI();
            case "CONFIRMED":

            case "IN_PROGRESS":
                return renderActiveRideUI();
            case "COMPLETED":
                return renderCompletedUI();
            case "CANCELLED":
                return renderCancelledUI();
            default:
                return null;
        }
    };

    // Render UI for searching state
    const renderSearchingUI = () => {
        return (
            <>
                <View style={styles.statusContainer}>
                    <Text style={[styles.statusTitle, { color: colors.text.primary }]}>
                        Buscando tu NILO
                    </Text>

                    <View style={styles.timeContainer}>
                        <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                        <Text style={[styles.timeText, { color: colors.text.secondary }]}>
                            Tiempo de búsqueda: {formatTime(elapsedTime)}
                        </Text>
                    </View>

                    <Text style={[styles.estimatedTime, { color: colors.text.primary }]}>
                        Tiempo estimado de espera: ~{estimatedArrival} min
                    </Text>

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
                        onPress={handleCancelTrip}
                        disabled={isLoading}
                    >
                        <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                            Cancelar búsqueda
                        </Text>
                    </TouchableOpacity>
                </View>
            </>
        );
    };

    // Render UI for active ride (CONFIRMED, ARRIVED, IN_PROGRESS)
    const renderActiveRideUI = () => {
        return (
            <>
                {/* Driver info */}
                <View style={styles.driverContainer}>
                    {/* Driver photo and rating */}
                    <View style={styles.driverInfo}>
                        <Image
                            source={{ uri: driverData.photo }}
                            style={styles.driverPhoto}
                            defaultSource={require('@/assets/images/icon.png')} // Fallback to app icon
                        />

                        <View style={styles.driverDetails}>
                            <Text style={[styles.driverName, { color: colors.text.primary }]}>
                                {driverData.name}
                            </Text>

                            <View style={styles.ratingContainer}>
                                <Ionicons name="star" size={16} color={colors.warning} />
                                <Text style={[styles.ratingText, { color: colors.text.secondary }]}>
                                    {driverData.rating} • {driverData.trips} viajes
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
                                    {driverData.vehicle.plate}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.vehicleDetails, { color: colors.text.primary }]}>
                            {driverData.vehicle.make} {driverData.vehicle.model} • {driverData.vehicle.year} • {driverData.vehicle.color}
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
                                {activeTrip?.startLocation?.name || "Ubicación de origen"}
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
                                {activeTrip?.endLocation?.name || "Ubicación de destino"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Status-specific messages and actions */}
                <View style={styles.statusMessageContainer}>
                    {activeTrip.status === "CONFIRMED" && (
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
                                    onPress={handleCancelTrip}
                                >
                                    <Ionicons name="close-outline" size={20} color={colors.error} />
                                    <Text style={[styles.actionButtonText, { color: colors.text.primary }]}>
                                        Cancelar
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}


                    {activeTrip.status === "IN_PROGRESS" && (
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
            </>
        );
    };

    // Render UI for completed trip
    const renderCompletedUI = () => {
        return (
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
                    onPress={handleTripComplete}
                >
                    <Text style={[styles.completeButtonText, { color: "white" }]}>
                        Calificar viaje
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.homeButton, { borderColor: colors.primary }]}
                    onPress={() => router.replace("/passenger")}
                >
                    <Text style={[styles.homeButtonText, { color: colors.primary }]}>
                        Volver al inicio
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Render UI for cancelled trip
    const renderCancelledUI = () => {
        return (
            <View style={styles.completedContainer}>
                <Ionicons name="close-circle" size={60} color={colors.error} />
                <Text style={[styles.completedTitle, { color: colors.text.primary }]}>
                    Viaje cancelado
                </Text>
                <Text style={[styles.completedMessage, { color: colors.text.secondary }]}>
                    {activeTrip.cancellationReason || "Este viaje ha sido cancelado."}
                </Text>
                <TouchableOpacity
                    style={[styles.homeButton, { borderColor: colors.primary }]}
                    onPress={() => router.replace("/passenger")}
                >
                    <Text style={[styles.homeButtonText, { color: colors.primary }]}>
                        Volver al inicio
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Map view */}
            <View style={[
                styles.mapContainer,
                (activeTrip.status === "COMPLETED" || activeTrip.status === "CANCELLED") && { height: 0 }
            ]}>
                {activeTrip && activeTrip.startLocation && (
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        initialRegion={{
                            latitude: activeTrip.startLocation.latitude,
                            longitude: activeTrip.startLocation.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        {/* Origin marker */}
                        <Marker
                            coordinate={{
                                latitude: activeTrip.startLocation.latitude,
                                longitude: activeTrip.startLocation.longitude,
                            }}
                            pinColor="green"
                            title="Origen"
                        />

                        {/* Destination marker */}
                        {activeTrip.endLocation && (
                            <Marker
                                coordinate={{
                                    latitude: activeTrip.endLocation.latitude,
                                    longitude: activeTrip.endLocation.longitude,
                                }}
                                pinColor="red"
                                title="Destino"
                            />
                        )}

                        {/* Driver marker (simulated position for demo) */}
                        {activeTrip.status !== "SEARCHING" && activeTrip.status !== "COMPLETED" && activeTrip.status !== "CANCELLED" && (
                            <Marker
                                coordinate={{
                                    latitude: activeTrip.startLocation.latitude - (activeTrip.status === "IN_PROGRESS" ? 0 : 0.005),
                                    longitude: activeTrip.startLocation.longitude - (activeTrip.status === "IN_PROGRESS" ? 0 : 0.005),
                                }}
                                title="Conductor"
                            >
                                <View style={styles.carMarker}>
                                    <Ionicons name="car" size={24} color={colors.primary} />
                                </View>
                            </Marker>
                        )}

                        {/* Route line */}
                        {activeTrip.status !== "SEARCHING" && (
                            <Polyline
                                coordinates={getRouteCoordinates()}
                                strokeWidth={4}
                                strokeColor={colors.primary}
                            />
                        )}
                    </MapView>
                )}

                {/* Pulse effect for searching */}
                {activeTrip.status === "SEARCHING" && (
                    <View style={styles.pulseContainer}>
                        <Animated.View
                            style={[
                                styles.pulse,
                                {
                                    backgroundColor: colors.primary + '40', // Add transparency
                                    transform: [{ scale: pulseAnim }],
                                },
                            ]}
                        />
                        <View style={[styles.center, { backgroundColor: colors.primary }]}>
                            <Ionicons name="car" size={24} color="white" />
                        </View>
                    </View>
                )}
            </View>

            {/* Status bar */}
            <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusText()}</Text>
            </View>

            {/* Trip details and status-specific UI */}
            <ScrollView
                style={[styles.detailsContainer, { backgroundColor: colors.background.primary }]}
                contentContainerStyle={styles.detailsContent}
                bounces={false}
            >
                {renderStatusSpecificUI()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
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
    mapContainer: {
        height: '40%',
        position: "relative",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    statusBar: {
        padding: 12,
        alignItems: "center",
    },
    statusText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    detailsContainer: {
        flex: 1,
    },
    detailsContent: {
        padding: 16,
        paddingBottom: 40,
    },

    // Searching UI
    pulseContainer: {
        position: "absolute",
        top: "50%",
        left: "50%",
        marginLeft: -40,
        marginTop: -40,
    },
    pulse: {
        width: 80,
        height: 80,
        borderRadius: 40,
        position: "absolute",
        top: 0,
        left: 0,
    },
    center: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 15,
        left: 15,
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
    estimatedTime: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
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

    // Active Ride UI
    carMarker: {
        padding: 5,
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
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

    // Completed UI
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