// app/trip/list.tsx
import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useTrip } from "@/src/hooks/useTrip";
import { Trip } from "@/src/stores/tripStore";
import {
    Header,
    EmptyState,
    Card,
    Text,
    Badge,
    Divider,
    StatusIndicator,
    LoadingOverlay,
    FloatingActionButton
} from "@/src/components/ui";
import { Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView, ScrollView } from "react-native-gesture-handler";

// Componente para cada viaje
const TripItem = ({ trip, onPress }: { trip: Trip; onPress: () => void }) => {
    const { colors } = useTheme();

    // Función que retorna la información del estado del viaje
    const getStatusInfo = (status: string) => {
        switch (status) {
            case "SEARCHING":
                return {
                    type: 'info' as const,
                    label: 'Buscando conductor',
                    icon: 'search'
                };
            case "CONFIRMED":
                return {
                    type: 'info' as const,
                    label: 'Conductor en camino',
                    icon: 'checkmark-circle'
                };
            case "ARRIVED":
                return {
                    type: 'info' as const,
                    label: 'Conductor ha llegado',
                    icon: 'location'
                };
            case "IN_PROGRESS":
                return {
                    type: 'info' as const,
                    label: 'En viaje',
                    icon: 'car'
                };
            case "COMPLETED":
                return {
                    type: 'success' as const,
                    label: 'Completado',
                    icon: 'checkmark-done-circle'
                };
            case "CANCELLED":
                return {
                    type: 'error' as const,
                    label: 'Cancelado',
                    icon: 'close-circle'
                };
            case "SCHEDULED":
                return {
                    type: 'warning' as const,
                    label: 'Programado',
                    icon: 'calendar'
                };
            default:
                return {
                    type: 'neutral' as const,
                    label: 'Estado desconocido',
                    icon: 'help-circle'
                };
        }
    };

    // Función para formatear fechas
    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleString('es-EC', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusInfo = getStatusInfo(trip.status);

    return (
        <Card style={styles.tripCard} variant="default" onPress={onPress}>
            <View style={styles.tripHeader}>
                <View style={styles.tripTypeContainer}>
                    <Text variant="subtitle" weight="semibold">
                        {trip.type === "ON_DEMAND" ? "NILO" : "NILO Rental"}
                    </Text>
                    <StatusIndicator
                        type={statusInfo.type}
                        label={statusInfo.label}
                        iconOverride={statusInfo.icon as keyof typeof Ionicons.glyphMap}
                        size="small"
                        inline
                    />
                </View>
                {trip.price && (
                    <Text variant="title" weight="semibold">
                        ${trip.price.toFixed(2)}
                    </Text>
                )}
            </View>

            <Divider margin="small" />

            <View style={styles.locationContainer}>
                <View style={styles.locationRow}>
                    <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                    <Text variant="body" numberOfLines={1}>
                        {trip.startLocation?.name || "Punto de origen"}
                    </Text>
                </View>

                <View style={styles.locationConnector}>
                    <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.locationRow}>
                    <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
                    <Text variant="body" numberOfLines={1}>
                        {trip.endLocation?.name || "Punto de destino"}
                    </Text>
                </View>
            </View>

            <Divider margin="small" />

            <View style={styles.tripFooter}>
                <View style={styles.tripInfoRow}>
                    <View style={styles.tripInfoItem}>
                        <Badge
                            variant="outline"
                            color="primary"
                            label={
                                trip.startedAt
                                    ? formatDate(trip.startedAt)
                                    : trip.scheduledAt
                                        ? formatDate(trip.scheduledAt)
                                        : formatDate(new Date().toISOString())
                            }
                            size="small"
                        />
                    </View>

                    {trip.distance && (
                        <View style={styles.tripInfoItem}>
                            <Text variant="caption" color="secondary">
                                {trip.distance.toFixed(1)} km
                            </Text>
                        </View>
                    )}

                    {trip.duration && (
                        <View style={styles.tripInfoItem}>
                            <Text variant="caption" color="secondary">
                                {trip.duration} min
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Card>
    );
};

export default function TripListScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { trips, fetchTrips, isLoading } = useTrip();
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'scheduled' | 'completed' | 'cancelled'>('active');

    // Cargar viajes al montar el componente
    useEffect(() => {
        loadTrips();
    }, []);

    // Función para cargar viajes
    const loadTrips = async () => {
        await fetchTrips();
    };

    // Función para refrescar la lista
    const onRefresh = async () => {
        setRefreshing(true);
        await loadTrips();
        setRefreshing(false);
    };

    // Filtrar viajes según el filtro activo
    const getFilteredTrips = (): Trip[] => {
        if (activeFilter === 'all') {
            return trips;
        }

        if (activeFilter === 'active') {
            return trips.filter(trip =>
                ["SEARCHING", "CONFIRMED", "ARRIVED", "IN_PROGRESS"].includes(trip.status)
            );
        }

        if (activeFilter === 'scheduled') {
            return trips.filter(trip => trip.status === "SCHEDULED");
        }

        if (activeFilter === 'completed') {
            return trips.filter(trip => trip.status === "COMPLETED");
        }

        if (activeFilter === 'cancelled') {
            return trips.filter(trip => trip.status === "CANCELLED");
        }

        return [];
    };

    // Navegar a los detalles del viaje
    const handleTripPress = (trip: Trip) => {
        if (trip.status === "COMPLETED") {
            router.push(`/trip/summary?tripId=${trip.id}`);
        } else {
            router.push(`/trip/details?tripId=${trip.id}`);
        }
    };

    // Renderizar cada chip de filtro
    const renderFilterChip = (
        label: string,
        value: 'all' | 'active' | 'scheduled' | 'completed' | 'cancelled',
        icon: keyof typeof Ionicons.glyphMap
    ) => {
        const isActive = activeFilter === value;

        return (
            <TouchableOpacity
                key={value}
                style={[
                    styles.filterChip,
                    isActive && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                ]}
                onPress={() => setActiveFilter(value)}
            >
                <Ionicons
                    name={icon}
                    size={16}
                    color={isActive ? colors.primary : colors.text.secondary}
                    style={styles.filterChipIcon}
                />
                <Text variant="caption" color={isActive ? "accent" : "secondary"} weight={isActive ? "semibold" : "normal"}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    const filteredTrips = getFilteredTrips();

    // Renderizar estado vacío según el filtro activo
    const renderEmptyState = () => {
        let icon: keyof typeof Ionicons.glyphMap = 'car-outline';
        let title = 'No hay viajes';
        let description = '';

        switch (activeFilter) {
            case 'active':
                title = 'No hay viajes activos';
                description = 'Solicita un NILO para comenzar a viajar';
                break;
            case 'scheduled':
                icon = 'calendar-outline';
                title = 'No hay viajes programados';
                description = 'Programa un viaje para más tarde';
                break;
            case 'completed':
                icon = 'checkmark-done-outline';
                title = 'No hay viajes completados';
                description = 'Tus viajes completados aparecerán aquí';
                break;
            case 'cancelled':
                icon = 'close-circle-outline';
                title = 'No hay viajes cancelados';
                description = 'No has cancelado ningún viaje';
                break;
            default:
                title = 'No hay viajes';
                description = 'Solicita un NILO para comenzar a viajar';
        }

        return (
            <EmptyState
                icon={icon}
                title={title}
                description={description}
                actionLabel="Solicitar un NILO"
                onAction={() => router.push('/trip/planner')}
                style={styles.emptyState}
            />
        );
    };

    return (
        <GestureHandlerRootView style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <Header title="Mis Viajes" showBackButton />

            {/* Filtros */}
            <View style={styles.filtersContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContent}>
                    {renderFilterChip('Activos', 'active', 'time')}
                    {renderFilterChip('Programados', 'scheduled', 'calendar')}
                    {renderFilterChip('Completados', 'completed', 'checkmark-circle')}
                    {renderFilterChip('Cancelados', 'cancelled', 'close-circle')}
                    {renderFilterChip('Todos', 'all', 'list')}
                </ScrollView>
            </View>

            {/* Lista de viajes */}
            {filteredTrips.length > 0 ? (
                <FlatList
                    data={filteredTrips}
                    renderItem={({ item }) => (
                        <TripItem
                            trip={item}
                            onPress={() => handleTripPress(item)}
                        />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                        />
                    }
                />
            ) : (
                renderEmptyState()
            )}

            <FloatingActionButton icon="add" onPress={() => router.push('/trip/planner')} position="bottomRight" />

            <LoadingOverlay visible={isLoading && !refreshing} text="Cargando viajes..." />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filtersContainer: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)'
    },
    filtersContent: {
        paddingHorizontal: 16,
        flexDirection: 'row'
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        marginRight: 8
    },
    filterChipIcon: {
        marginRight: 6
    },
    listContent: {
        padding: 16,
        paddingBottom: 100, // Espacio extra para el FAB
    },
    emptyState: {
        marginTop: 60
    },
    tripCard: {
        marginBottom: 16,
    },
    tripHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tripTypeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },
    locationContainer: {
        marginVertical: 4,
    },
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 4,
    },
    locationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    locationConnector: {
        paddingLeft: 4,
        height: 16,
    },
    verticalLine: {
        width: 1,
        height: "100%",
    },
    tripFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    tripInfoRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    tripInfoItem: {
        marginRight: 16,
    },
});
