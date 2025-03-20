// app/passenger/index.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import SearchBar from "@/src/components/passenger/SearchBar";
import RecentTrips from "@/src/components/passenger/RecentTrips";
import Suggestions from "@/src/components/passenger/Suggestions";
import Promotions from "@/src/components/passenger/Promotions";
import ActiveTripCard from "@/src/components/passenger/ActiveTripCard";
import { useTrip } from "@/src/hooks/useTrip";
import { FloatingActionButton, EmptyState } from "@/src/components/ui";

// Sample data for components (in production would come from API)
const recentTrips = [
    {
        id: "1",
        name: "Oficina",
        address: "Calle Principal 123",
        frequency: "3 veces/semana"
    },
    {
        id: "2",
        name: "Casa",
        address: "Av. Libertad 456",
        frequency: "2 veces/semana"
    }
];

const suggestions = [
    {
        id: "1",
        title: "Centro Comercial",
        distance: "2.5 km",
        rating: 4.8
    },
    {
        id: "2",
        title: "Aeropuerto",
        distance: "15 km",
        rating: 4.9
    },
    {
        id: "3",
        title: "Plaza Central",
        distance: "1.2 km",
        rating: 4.7
    }
];

const promotions: any[] = [
    {
        id: "1",
        title: "25% OFF en tu próximo viaje",
        description: "Válido hasta mañana",
        type: "discount"
    },
    {
        id: "2",
        title: "Gana puntos NILO",
        description: "Acumula y obtén beneficios",
        type: "rewards"
    },
    {
        id: "3",
        title: "Viajes VIP",
        description: "Prueba nuestra experiencia premium",
        type: "special"
    }
];

export default function HomeScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { fetchTrips, trips, getActiveTrips } = useTrip();
    const [activeTrips, setActiveTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load trips when component mounts
    useEffect(() => {
        loadTrips();
    }, []);

    // Update active trips when the list of trips changes
    useEffect(() => {
        const active = getActiveTrips();
        setActiveTrips(active);
        setIsLoading(false);
    }, [trips, getActiveTrips]);

    // Load trips
    const loadTrips = async () => {
        setIsLoading(true);
        await fetchTrips();
    };

    // View all trips
    const handleViewAllTrips = () => {
        router.push('/trip/list');
    };

    // Request new trip
    const handleRequestTrip = () => {
        router.push('/trip/planner');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <SearchBar />

                {/* Active trips section */}
                {activeTrips.length > 0 && (
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <View style={styles.sectionTitle}>
                                <EmptyState
                                    title="Viajes activos"
                                    description={`Tienes ${activeTrips.length} viaje${activeTrips.length > 1 ? 's' : ''} activo${activeTrips.length > 1 ? 's' : ''}`}
                                    icon="car"
                                    actionLabel="Ver todos"
                                    onAction={handleViewAllTrips}
                                    style={styles.activeTripsEmpty}
                                />
                            </View>
                        </View>

                        {activeTrips.map(trip => (
                            <ActiveTripCard key={trip.id} trip={trip} />
                        ))}
                    </View>
                )}

                {/* Main content */}
                <RecentTrips trips={recentTrips} />
                <Suggestions suggestions={suggestions} />
                <Promotions promotions={promotions} />
            </ScrollView>

            {/* Floating action button for requesting a trip */}
            <FloatingActionButton
                icon="car"
                label="Solicitar NILO"
                onPress={handleRequestTrip}
                extended={true}
                position="bottomRight"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 80, // Extra space for FAB
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        flex: 1,
    },
    activeTripsEmpty: {
        minHeight: 0,
        padding: 0,
        alignItems: 'flex-start',
    },
});