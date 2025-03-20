// app/passenger/index.tsx
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import SearchBar from "@/src/components/passenger/SearchBar";
import RecentTrips from "@/src/components/passenger/RecentTrips";
import Suggestions from "@/src/components/passenger/Suggestions";
import Promotions from "@/src/components/passenger/Promotions";
import ActiveTripsSection from "@/src/components/passenger/ActiveTripsSection";
import { useTrip } from "@/src/hooks/useTrip";
import { FloatingActionButton } from "@/src/components/ui";

// Sample data for components (en producción vendría de la API)
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
    const [refreshing, setRefreshing] = useState(false);

    // Cargar viajes cuando el componente se monta
    useEffect(() => {
        loadTrips();
    }, []);

    // Actualizar viajes activos cuando cambia la lista de viajes
    useEffect(() => {
        const active = getActiveTrips();
        setActiveTrips(active);
        setIsLoading(false);
    }, [trips, getActiveTrips]);

    // Cargar viajes
    const loadTrips = async () => {
        setIsLoading(true);
        await fetchTrips();
    };

    // Manejar refresco de la pantalla
    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchTrips();
        setRefreshing(false);
    };

    // Solicitar nuevo viaje
    const handleRequestTrip = () => {
        router.push('/trip/planner');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                        tintColor={colors.primary}
                    />
                }
            >
                <SearchBar />

                {/* Sección de viajes activos */}
                <ActiveTripsSection activeTrips={activeTrips} />

                {/* Contenido principal */}
                <RecentTrips trips={recentTrips} />
                <Suggestions suggestions={suggestions} />
                <Promotions promotions={promotions} />
            </ScrollView>

            {/* Botón flotante para solicitar un viaje */}
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
        paddingBottom: 80, // Espacio extra para el FAB
        gap: 16,
    }
});