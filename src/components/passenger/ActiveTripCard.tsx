// src/components/passenger/ActiveTripCard.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { Trip } from '@/src/stores/tripStore';
import { useRouter } from 'expo-router';
import { Text, Card, Button, Avatar, Badge } from '@/src/components/ui';

interface ActiveTripCardProps {
    trip: Trip;
}

const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ trip }) => {
    const { colors } = useTheme();
    const router = useRouter();

    // Navigate to trip details
    const handleContinueTrip = () => {
        router.push(`/trip/details?tripId=${trip.id}`);
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
    const getStatusColor = (): 'primary' | 'warning' | 'error' | 'success' => {
        switch (trip.status) {
            case 'SEARCHING':
                return 'primary';
            case 'CONFIRMED':
                return 'primary';
            case 'IN_PROGRESS':
                return 'primary';
            case 'SCHEDULED':
                return 'warning';
            default:
                return 'primary';
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
            {/* Status bar */}
            <View style={[
                styles.statusBar,
                { backgroundColor: colors[getStatusColor()] }
            ]} />

            <View style={styles.content}>
                {/* Status section */}
                <View style={styles.statusSection}>
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: colors[getStatusColor()] + '20' }
                    ]}>
                        <Ionicons
                            name={getStatusIcon() as any}
                            size={20}
                            color={colors[getStatusColor()]}
                        />
                    </View>
                    <Text
                        style={{ color: colors[getStatusColor()] }}
                        variant="body"
                        weight="semibold"
                    >
                        {getStatusMessage()}
                    </Text>
                </View>

                {/* Trip details */}
                <View style={styles.tripDetails}>
                    {/* Origin and destination */}
                    <View style={styles.locations}>
                        <View style={styles.locationRow}>
                            <View style={[
                                styles.locationDot,
                                { backgroundColor: colors.success }
                            ]} />
                            <Text
                                variant="body"
                                numberOfLines={1}
                            >
                                {trip.startLocation?.name || "Origen"}
                            </Text>
                        </View>

                        <View style={styles.locationRow}>
                            <View style={[
                                styles.locationDot,
                                { backgroundColor: colors.error }
                            ]} />
                            <Text
                                variant="body"
                                numberOfLines={1}
                            >
                                {trip.endLocation?.name || "Destino"}
                            </Text>
                        </View>
                    </View>

                    {/* Driver info if available */}
                    {(trip.status === 'CONFIRMED' || trip.status === 'IN_PROGRESS') && trip.driver && (
                        <View style={[
                            styles.driverInfo,
                            { borderTopColor: colors.border }
                        ]}>
                            <Avatar
                                source={trip.driver.profilePicture ?
                                    { uri: trip.driver.profilePicture } :
                                    require('@/assets/images/icon.png')
                                }
                                name={`${trip.driver.firstName} ${trip.driver.lastName}`}
                                size="small"
                            />
                            <View style={styles.driverDetails}>
                                <Text variant="body" weight="medium">
                                    {trip.driver.firstName} {trip.driver.lastName}
                                </Text>
                                {trip.vehicle && (
                                    <Text variant="caption" color="secondary">
                                        {trip.vehicle.make} {trip.vehicle.model} • {trip.vehicle.plate}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Action button */}
                <View style={styles.actionSection}>
                    <Button
                        title="Continuar"
                        icon="chevron-forward"
                        iconPosition="right"
                        size="small"
                        variant="primary"
                        onPress={handleContinueTrip}
                    />
                </View>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        overflow: 'hidden',
    },
    statusBar: {
        height: 4,
        width: '100%',
    },
    content: {
        padding: 16,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    tripDetails: {
        marginBottom: 16,
    },
    locations: {
        marginBottom: 12,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    locationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 8,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        paddingTop: 12,
    },
    driverDetails: {
        flex: 1,
        marginLeft: 12,
    },
    actionSection: {
        alignItems: 'flex-end',
    },
});

export default ActiveTripCard;