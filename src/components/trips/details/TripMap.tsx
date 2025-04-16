// src/components/trips/details/TripMap.tsx
import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useTheme } from "@/src/theme/ThemeContext";
import { Trip } from "@/src/stores/tripStore";

interface TripMapProps {
    trip: Trip;
    route: any | null;
    driverLocation: {
        latitude: number;
        longitude: number;
        heading?: number;
    } | null;
    isSearching: boolean;
    wsConnected: boolean;
}

const TripMap: React.FC<TripMapProps> = ({
    trip,
    route,
    driverLocation,
    isSearching,
    wsConnected
}) => {
    const { colors } = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Current driver location or fallback
    const currentDriverLocation = driverLocation || (trip.driver ? {
        latitude: trip.startLocation.latitude - (trip.status === "IN_PROGRESS" ? 0 : 0.005),
        longitude: trip.startLocation.longitude - (trip.status === "IN_PROGRESS" ? 0 : 0.005),
    } : null);

    // Get route coordinates
    const getRouteCoordinates = () => {
        if (trip?.startLocation && trip?.endLocation) {
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
                    latitude: trip.startLocation.latitude,
                    longitude: trip.startLocation.longitude
                },
                {
                    latitude: trip.endLocation.latitude,
                    longitude: trip.endLocation.longitude
                }
            ];
        }
        return [];
    };

    // Pulse animation for the searching indicator
    useEffect(() => {
        if (isSearching) {
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
    }, [isSearching]);

    return (
        <View style={styles.mapContainer}>
            <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                    latitude: trip.startLocation.latitude,
                    longitude: trip.startLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
            >
                {/* Origin marker */}
                <Marker
                    coordinate={{
                        latitude: trip.startLocation.latitude,
                        longitude: trip.startLocation.longitude,
                    }}
                    pinColor="green"
                    title="Origen"
                />

                {/* Destination marker */}
                {trip.endLocation && (
                    <Marker
                        coordinate={{
                            latitude: trip.endLocation.latitude,
                            longitude: trip.endLocation.longitude,
                        }}
                        pinColor="red"
                        title="Destino"
                    />
                )}

                {/* Driver marker */}
                {(trip.status === "CONFIRMED" || trip.status === "IN_PROGRESS") && currentDriverLocation && (
                    <Marker
                        coordinate={{
                            latitude: currentDriverLocation.latitude,
                            longitude: currentDriverLocation.longitude,
                        }}
                        title="Conductor"
                    >
                        <View style={styles.carMarker}>
                            <Ionicons name="car" size={24} color={colors.primary} />
                        </View>
                    </Marker>
                )}

                {/* Route line */}
                {trip.status !== "SEARCHING" && (
                    <Polyline
                        coordinates={getRouteCoordinates()}
                        strokeWidth={4}
                        strokeColor={colors.primary}
                    />
                )}
            </MapView>

            {/* Pulse effect for searching */}
            {isSearching && (
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

            {/* WebSocket connection indicator */}
            <Pressable
                style={[
                    styles.wsIndicator,
                    { backgroundColor: wsConnected ? colors.success + '40' : colors.error + '40' }
                ]}
            >
                <Ionicons
                    name={wsConnected ? ("wifi-outline" as any) : ("wifi-off-outline" as any)}
                    size={16}
                    color={wsConnected ? colors.success : colors.error}
                />
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    mapContainer: {
        height: '40%',
        position: "relative",
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
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
    carMarker: {
        padding: 5,
        backgroundColor: "white",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    wsIndicator: {
        position: "absolute",
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        flexDirection: "row",
        alignItems: "center",
    },
});

export default TripMap;