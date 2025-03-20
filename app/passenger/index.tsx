// app/passenger/index.tsx (Actualizado)
import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from "@/src/theme/ThemeContext";
import { useRouter } from "expo-router";
import SearchBar from "@/src/components/passenger/SearchBar";
import RecentTrips from "@/src/components/passenger/RecentTrips";
import Suggestions from "@/src/components/passenger/Suggestions";
import Promotions from "@/src/components/passenger/Promotions";
import ActiveTripCard from "@/src/components/passenger/ActiveTripCard";
import { useTrip } from "@/src/hooks/useTrip";
import { Ionicons } from "@expo/vector-icons";

// Datos simulados para componentes (en producción vendrían de la API)
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

const promotions = [
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

    // Cargar viajes al montar el componente
    useEffect(() => {
        loadTrips();
    }, []);

    // Actualizar viajes activos cuando cambia la lista de viajes
    useEffect(() => {
        const active = getActiveTrips();
        setActiveTrips(active);
    }, [trips, getActiveTrips]);

    // Cargar viajes
    const loadTrips = async () => {
        await fetchTrips();
    };

    // Ver todos los viajes
    const handleViewAllTrips = () => {
        router.push('/trip/list');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
            <ScrollView style={{ padding: 16 }}>
                <View style={{ gap: 16 }}>
                    <SearchBar />

                    {/* Sección de viajes activos */}
                    {activeTrips.length > 0 && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                                    Viajes activos
                                </Text>
                                <TouchableOpacity onPress={handleViewAllTrips}>
                                    <Text style={[styles.viewAllText, { color: colors.primary }]}>
                                        Ver todos
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {activeTrips.map(trip => (
                                <ActiveTripCard key={trip.id} trip={trip} />
                            ))}
                        </View>
                    )}

                    <RecentTrips trips={recentTrips} />
                    <Suggestions suggestions={suggestions} />
                    <Promotions promotions={promotions as any} />
                </View>
            </ScrollView>

            {/* Botón flotante para ver todos los viajes */}
            {activeTrips.length > 0 && (
                <TouchableOpacity
                    style={[styles.floatingButton, { backgroundColor: colors.primary }]}
                    onPress={handleViewAllTrips}
                >
                    <Ionicons name="list" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    section: {
        marginBottom: 8,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "500",
    },
    floatingButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    }
});