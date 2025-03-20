// src/components/passenger/ActiveTripCard.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { Trip } from '@/src/stores/tripStore';
import { useRouter } from 'expo-router';
import { Text, Card, Avatar } from '@/src/components/ui';

interface ActiveTripCardProps {
    trip: Trip;
}

const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ trip }) => {
    const { colors } = useTheme();
    const router = useRouter();

    // Navigate to trip details
    const handleContinueTrip = () => {
        router.push(`/trip/details?tripId=${trip.tripId}`);
    };

    // Format time
    const getFormattedTime = () => {
        if (trip.status === 'SCHEDULED' && trip.scheduledAt) {
            const date = new Date(trip.scheduledAt);
            return date.toLocaleTimeString('es-EC', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        return '';
    };

    // Get status message based on state
    const getStatusMessage = () => {
        switch (trip.status) {
            case 'SEARCHING':
                return 'Buscando conductor...';
            case 'CONFIRMED':
                return 'Conductor en camino';

            case 'IN_PROGRESS':
                return 'Viaje en progreso';
            case 'SCHEDULED':
                return `Programado para ${getFormattedTime()}`;
            default:
                return 'Viaje activo';
        }
    };

    // Get color based on status
    const getStatusColor = () => {
        switch (trip.status) {
            case 'SEARCHING':
                return colors.primary;
            case 'CONFIRMED':
                return colors.primary;

            case 'IN_PROGRESS':
                return colors.primary;
            case 'SCHEDULED':
                return colors.warning;
            default:
                return colors.primary;
        }
    };

    // Get icon based on status
    const getStatusIcon = () => {
        switch (trip.status) {
            case 'SEARCHING':
                return 'search';
            case 'CONFIRMED':
                return 'car-outline';

            case 'IN_PROGRESS':
                return 'navigate';
            case 'SCHEDULED':
                return 'calendar';
            default:
                return 'car';
        }
    };

    return (
        <Card
            style={styles.container}
            variant="default"
            padding="none"
            onPress={handleContinueTrip}
        >
            <View style={[styles.content, { borderLeftColor: getStatusColor(), borderLeftWidth: 4 }]}>
                <View style={styles.mainContent}>
                    {/* Status and Route section */}
                    <View style={styles.leftSection}>
                        {/* Status indicator */}
                        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() + '20' }]}>
                            <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
                        </View>

                        {/* Route info */}
                        <View style={styles.routeInfo}>
                            <View style={styles.locationRow}>
                                <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                                <Text variant="caption" weight="medium" color="primary" numberOfLines={1}>
                                    {trip.trip.origin || "Origen"}
                                </Text>
                            </View>

                            <View style={styles.locationConnector}>
                                <View style={[styles.verticalLine, { backgroundColor: colors.border }]} />
                            </View>

                            <View style={styles.locationRow}>
                                <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
                                <Text variant="caption" weight="medium" color="primary" numberOfLines={1}>
                                    {trip.trip.destination || "Destino"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Driver info or status message */}
                    <View style={styles.rightSection}>
                        {/* Driver info if available */}
                        {(trip.status === 'CONFIRMED' || trip.status === 'IN_PROGRESS') && trip.driver ? (
                            <View style={styles.driverContainer}>
                                <Avatar
                                    source={trip.driver.profilePicture ? { uri: trip.driver.profilePicture } : undefined}
                                    name={`${trip.driver.firstName || ''} ${trip.driver.lastName || ''}`}
                                    size="tiny"
                                    variant="circle"
                                />
                                <Text variant="caption" color="secondary" style={styles.statusText}>
                                    {getStatusMessage()}
                                </Text>
                            </View>
                        ) : (
                            <Text variant="caption" color="secondary" style={styles.statusText}>
                                {getStatusMessage()}
                            </Text>
                        )}

                        {/* Continue button */}
                        <TouchableOpacity
                            style={[styles.continueButton, { backgroundColor: colors.primary + '10' }]}
                            onPress={handleContinueTrip}
                        >
                            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 6,
        borderRadius: 8,
        overflow: 'hidden',
    },
    content: {
        padding: 12,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        marginRight: 8,
    },
    statusIndicator: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        alignSelf: 'center',
    },
    routeInfo: {
        flex: 1,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    locationConnector: {
        paddingLeft: 3,
        height: 10,
    },
    verticalLine: {
        width: 1,
        height: '100%',
        marginVertical: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    driverContainer: {
        alignItems: 'flex-end',
        marginBottom: 4,
    },
    statusText: {
        marginTop: 2,
        fontSize: 12,
    },
    continueButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default ActiveTripCard;