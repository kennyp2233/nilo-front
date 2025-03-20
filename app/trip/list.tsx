// app/trip/list.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useTrip } from "@/src/hooks/useTrip";
import { Trip } from "@/src/stores/tripStore";

// Tipos de filtro para los viajes
type TripFilter = "ACTIVE" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "ALL";

export default function TripListScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { trips, fetchTrips, isLoading } = useTrip();
    const [activeFilter, setActiveFilter] = useState<TripFilter>("ACTIVE");
    const [refreshing, setRefreshing] = useState(false);

    // Cargar viajes al montar el componente
    useEffect(() => {
        loadTrips();
    }, []);

    // Cargar viajes
    const loadTrips = async () => {
        await fetchTrips();
    };

    // Refrescar lista de viajes
    const onRefresh = async () => {
        setRefreshing(true);
        await loadTrips();
        setRefreshing(false);
    };

    // Filtrar viajes según el filtro activo
    const getFilteredTrips = (): Trip[] => {
        if (activeFilter === "ALL") {
            return trips;
        }

        if (activeFilter === "ACTIVE") {
            // Viajes activos: buscando, confirmados, en camino, o en progreso
            return trips.filter(trip =>
                ["SEARCHING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"].includes(trip.status)
            );
        }

        if (activeFilter === "SCHEDULED") {
            // Viajes programados para el futuro
            return trips.filter(trip => trip.status === "SCHEDULED");
        }

        if (activeFilter === "COMPLETED") {
            // Viajes completados
            return trips.filter(trip => trip.status === "COMPLETED");
        }

        if (activeFilter === "CANCELLED") {
            // Viajes cancelados
            return trips.filter(trip => trip.status === "CANCELLED");
        }

        return [];
    };

    // Navegar a los detalles de un viaje
    const handleTripPress = (trip: Trip) => {
        if (trip.status === "COMPLETED") {
            // Si está completado, ir al resumen
            router.push(`/trip/summary?tripId=${trip.id}`);
        } else {
            // De lo contrario, ir a los detalles
            router.push(`/trip/details?tripId=${trip.id}`);
        }
    };

    // Obtener ícono según el estado del viaje
    const getTripStatusIcon = (status: string) => {
        switch (status) {
            case "SEARCHING":
                return { name: "search", color: colors.primary };
            case "CONFIRMED":
                return { name: "checkmark-circle", color: colors.primary };
            case "ARRIVED":
                return { name: "location", color: colors.success };
            case "IN_PROGRESS":
                return { name: "car", color: colors.primary };
            case "COMPLETED":
                return { name: "checkmark-done-circle", color: colors.success };
            case "CANCELLED":
                return { name: "close-circle", color: colors.error };
            case "SCHEDULED":
                return { name: "calendar", color: colors.warning };
            default:
                return { name: "help-circle", color: colors.text.secondary };
        }
    };

    // Obtener texto descriptivo del estado
    const getTripStatusText = (status: string) => {
        switch (status) {
            case "SEARCHING":
                return "Buscando conductor";
            case "CONFIRMED":
                return "Conductor en camino";
            case "ARRIVED":
                return "Conductor ha llegado";
            case "IN_PROGRESS":
                return "En viaje";
            case "COMPLETED":
                return "Completado";
            case "CANCELLED":
                return "Cancelado";
            case "SCHEDULED":
                return "Programado";
            default:
                return "Estado desconocido";
        }
    };

    // Formatear fecha
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Renderizar un elemento de la lista de viajes
    const renderTripItem = ({ item }: { item: Trip }) => {
        const statusIcon = getTripStatusIcon(item.status);

        return (
            <TouchableOpacity
                style={[styles.tripItem, { backgroundColor: colors.background.secondary }]}
                onPress={() => handleTripPress(item)}
            >
                <View style={[styles.statusIconContainer, { backgroundColor: statusIcon.color + '20' }]}>
                    <Ionicons name={statusIcon.name as any} size={24} color={statusIcon.color} />
                </View>

                <View style={styles.tripDetails}>
                    <View style={styles.tripHeader}>
                        <Text style={[styles.tripType, { color: colors.text.primary }]}>
                            {item.type === "ON_DEMAND" ? "NILO" : "NILO Rental"}
                        </Text>
                        <Text style={[styles.tripStatus, { color: statusIcon.color }]}>
                            {getTripStatusText(item.status)}
                        </Text>
                    </View>

                    <View style={styles.tripLocations}>
                        <View style={styles.locationRow}>
                            <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.locationText, { color: colors.text.secondary }]} numberOfLines={1}>
                                {item.startLocation?.name || "Punto de origen"}
                            </Text>
                        </View>

                        <View style={styles.locationRow}>
                            <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
                            <Text style={[styles.locationText, { color: colors.text.secondary }]} numberOfLines={1}>
                                {item.endLocation?.name || "Punto de destino"}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.tripFooter}>
                        <Text style={[styles.tripDate, { color: colors.text.tertiary }]}>
                            {item.startedAt ? formatDate(item.startedAt) :
                                item.scheduledAt ? formatDate(item.scheduledAt) :
                                    formatDate(new Date().toISOString())}
                        </Text>

                        {item.price && (
                            <Text style={[styles.tripPrice, { color: colors.text.primary }]}>
                                ${item.price.toFixed(2)}
                            </Text>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // Renderizar filtros
    const renderFilterButton = (filter: TripFilter, label: string, icon: string) => (
        <TouchableOpacity
            style={[
                styles.filterButton,
                activeFilter === filter && { backgroundColor: colors.primary + '20' },
            ]}
            onPress={() => setActiveFilter(filter)}
        >
            <Ionicons
                name={icon as any}
                size={20}
                color={activeFilter === filter ? colors.primary : colors.text.secondary}
            />
            <Text
                style={[
                    styles.filterButtonText,
                    { color: activeFilter === filter ? colors.primary : colors.text.secondary },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    // Renderizar mensaje cuando no hay viajes
    const renderEmptyList = () => {
        if (isLoading) {
            return (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                        Cargando viajes...
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="car-outline" size={64} color={colors.text.tertiary} />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    No hay viajes {getEmptyStateMessage()}
                </Text>
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
                    {getEmptyStateDescription()}
                </Text>

                <TouchableOpacity
                    style={[styles.newTripButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/trip/planner')}
                >
                    <Text style={styles.newTripButtonText}>Solicitar un NILO</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // Mensaje para el estado vacío según el filtro activo
    const getEmptyStateMessage = () => {
        switch (activeFilter) {
            case "ACTIVE":
                return "activos";
            case "SCHEDULED":
                return "programados";
            case "COMPLETED":
                return "completados";
            case "CANCELLED":
                return "cancelados";
            default:
                return "";
        }
    };

    // Descripción para el estado vacío según el filtro activo
    const getEmptyStateDescription = () => {
        switch (activeFilter) {
            case "ACTIVE":
                return "Solicita un NILO para comenzar a viajar";
            case "SCHEDULED":
                return "Programa un viaje para más tarde";
            case "COMPLETED":
                return "Tus viajes completados aparecerán aquí";
            case "CANCELLED":
                return "No has cancelado ningún viaje";
            default:
                return "Solicita un NILO para comenzar";
        }
    };

    const filteredTrips = getFilteredTrips();

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            {/* Encabezado */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                    Mis Viajes
                </Text>
                <TouchableOpacity
                    style={[styles.requestButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/trip/planner')}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.requestButtonText}>Nuevo</Text>
                </TouchableOpacity>
            </View>

            {/* Filtros */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filtersContainer}
                contentContainerStyle={styles.filtersContent}
            >
                {renderFilterButton("ACTIVE", "Activos", "time-outline")}
                {renderFilterButton("SCHEDULED", "Programados", "calendar-outline")}
                {renderFilterButton("COMPLETED", "Completados", "checkmark-circle-outline")}
                {renderFilterButton("CANCELLED", "Cancelados", "close-circle-outline")}
                {renderFilterButton("ALL", "Todos", "list-outline")}
            </ScrollView>

            {/* Lista de viajes */}
            <FlatList
                data={filteredTrips}
                renderItem={renderTripItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
                }
            />
        </View>
    );
}

// Componente ScrollView para los filtros
const ScrollView = ({ children, ...props }: any) => {
    return (
        <View {...props}>
            <View {...props.contentContainerStyle}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
    },
    requestButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    requestButtonText: {
        color: "white",
        fontWeight: "600",
        marginLeft: 4,
    },
    filtersContainer: {
        paddingHorizontal: 16,
    },
    filtersContent: {
        flexDirection: "row",
        paddingBottom: 12,
    },
    filterButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        borderRadius: 16,
    },
    filterButtonText: {
        fontWeight: "500",
        marginLeft: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Espacio extra para el bottom tab
    },
    tripItem: {
        flexDirection: "row",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    statusIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    tripDetails: {
        flex: 1,
    },
    tripHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    tripType: {
        fontSize: 16,
        fontWeight: "600",
    },
    tripStatus: {
        fontSize: 14,
        fontWeight: "500",
    },
    tripLocations: {
        marginBottom: 12,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    locationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    locationText: {
        fontSize: 14,
    },
    tripFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tripDate: {
        fontSize: 12,
    },
    tripPrice: {
        fontSize: 16,
        fontWeight: "600",
    },
    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        marginTop: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginTop: 16,
        marginBottom: 8,
        textAlign: "center",
    },
    emptyText: {
        fontSize: 14,
        textAlign: "center",
        marginBottom: 24,
    },
    newTripButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    newTripButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
});