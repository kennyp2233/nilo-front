// src/app/(passenger)/index.tsx
import React from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import TopTabs from "@/components/passenger/TopTabs";
import CustomTabs from "@/components/common/CustomTabs";
import SearchBar from "@/components/passenger/SearchBar";
import RecentTrips from "@/components/passenger/RecentTrips";
import Suggestions from "@/components/passenger/Suggestions";
import Promotions from "@/components/passenger/Promotions";


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

    return (
        <View style={[styles.container, { backgroundColor: colors.background.primary }]}>


            <ScrollView style={{ padding: 16 }}>
                <View style={{ gap: 12 }}>
                    <SearchBar />
                    <RecentTrips trips={recentTrips} />
                    <Suggestions suggestions={suggestions} />
                    <Promotions promotions={promotions as any} />
                </View>
            </ScrollView>

        </View> 
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

    }
});