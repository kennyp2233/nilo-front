// app/trip/details.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useTrip } from "@/src/hooks/useTrip";
import TripMap from "@/src/components/trips/details/TripMap";
import StatusBar from "@/src/components/trips/details/StatusBar";
import SearchingUI from "@/src/components/trips/details/SearchingUI";
import ActiveRideUI from "@/src/components/trips/details/ActiveRideUI";
import CompletedUI from "@/src/components/trips/details/CompletedUI";
import CancelledUI from "@/src/components/trips/details/CancelledUI";
import LoadingState from "@/src/components/trips/details/LoadingState";
import ErrorState from "@/src/components/trips/details/ErrorState";

export default function TripDetailsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const {
        activeTrip,
        isLoading,
        wsConnected,
        cancelTrip,
        updateTripStatus,
        driverLocation,
        route,
        searchTimeElapsed,
        estimatedArrival,
    } = useTrip(tripId);

    if (!activeTrip && isLoading) {
        return <LoadingState />;
    }

    if (!activeTrip) {
        return <ErrorState onGoBack={() => router.replace("/passenger")} />;
    }

    // Determine status color based on trip status
    const getStatusColor = () => {
        switch (activeTrip.status) {
            case "SEARCHING": return colors.primary;
            case "CONFIRMED": return colors.primary;
            case "IN_PROGRESS": return colors.primary;
            case "COMPLETED": return colors.success;
            case "CANCELLED": return colors.error;
            default: return colors.primary;
        }
    };

    // Get status text based on current status
    const getStatusText = () => {
        switch (activeTrip.status) {
            case "SEARCHING":
                return "Buscando tu NILO";
            case "CONFIRMED":
                return `Tu conductor llegará en ${estimatedArrival || 5} min`;
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

    // Handle cancel button
    const handleCancelTrip = async (reason?: string) => {
        if (tripId) {
            const cancelReason = reason || (activeTrip.status === "SEARCHING"
                ? "Usuario canceló la búsqueda"
                : "Usuario canceló el viaje");

            const success = await cancelTrip(tripId, cancelReason);
            if (success) {
                router.replace("/passenger");
            }
        }
    };

    // Render different UI components based on trip status
    const renderStatusSpecificUI = () => {
        switch (activeTrip.status) {
            case "SEARCHING":
                return (
                    <SearchingUI
                        searchTimeElapsed={searchTimeElapsed}
                        wsConnected={wsConnected}
                        onCancel={handleCancelTrip}
                    />
                );
            case "CONFIRMED":
            case "IN_PROGRESS":
                return (
                    <ActiveRideUI
                        trip={activeTrip}
                        estimatedArrival={estimatedArrival}
                        onCancel={handleCancelTrip}
                    />
                );
            case "COMPLETED":
                return (
                    <CompletedUI
                        tripId={tripId}
                        onGoToRating={() => router.replace(`/trip/summary?tripId=${tripId}`)}
                        onGoHome={() => router.replace("/passenger")}
                    />
                );
            case "CANCELLED":
                return (
                    <CancelledUI
                        cancellationReason={activeTrip.cancellationReason}
                        onGoHome={() => router.replace("/passenger")}
                    />
                );
            default:
                return null;
        }
    };

    // Determine if the map should be hidden
    const isMapHidden = activeTrip.status === "COMPLETED" || activeTrip.status === "CANCELLED";

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Map view (hidden for completed/cancelled trips) */}
            {!isMapHidden && (
                <TripMap
                    trip={activeTrip}
                    route={route}
                    driverLocation={driverLocation}
                    isSearching={activeTrip.status === "SEARCHING"}
                    wsConnected={wsConnected}
                />
            )}

            {/* Status bar */}
            <StatusBar
                statusText={getStatusText()}
                statusColor={getStatusColor()}
            />

            {/* Trip details and status-specific UI */}
            {renderStatusSpecificUI()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});