// src/components/passenger/ActiveTripsSection.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import ActiveTripCard from './ActiveTripCard';
import { Trip } from '@/src/stores/tripStore';

interface ActiveTripsSectionProps {
    activeTrips: Trip[];
}

const ActiveTripsSection: React.FC<ActiveTripsSectionProps> = ({ activeTrips }) => {
    const router = useRouter();
    const { colors } = useTheme();

    if (activeTrips.length === 0) {
        return null;
    }

    // View all trips
    const handleViewAllTrips = () => {
        router.push('/trip/list');
    };

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <View style={styles.titleContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                        Viajes activos
                    </Text>
                    <View style={styles.tripCountContainer}>
                        <Text style={[styles.tripCount, { color: colors.text.secondary }]}>
                            {activeTrips.length} viaje{activeTrips.length > 1 ? 's' : ''}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.viewAllButton, { backgroundColor: colors.background.secondary }]}
                    onPress={handleViewAllTrips}
                >
                    <Text style={[styles.viewAllText, { color: colors.primary }]}>Ver todos</Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {activeTrips.map(trip => (
                <ActiveTripCard key={trip.tripId} trip={trip} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginRight: 8,
    },
    tripCountContainer: {
        marginTop: 2,
    },
    tripCount: {
        fontSize: 14,
    },
    viewAllButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 16,
    },
    viewAllText: {
        fontSize: 14,
        fontWeight: "500",
        marginRight: 4,
    }
});

export default ActiveTripsSection;