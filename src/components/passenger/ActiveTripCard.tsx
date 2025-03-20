// src/components/passenger/ActiveTripCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { Trip } from '@/src/stores/tripStore';
import { useRouter } from 'expo-router';

interface ActiveTripCardProps {
    trip: Trip;
}

const ActiveTripCard: React.FC<ActiveTripCardProps> = ({ trip }) => {
    const { colors } = useTheme();
    const router = useRouter();

    // Continuar al viaje
    const handleContinueTrip = () => {
        router.push(`/trip/details?tripId=${trip.id}`);
    };

    // Formatear tiempo
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

    // Obtener mensaje según estado
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

    // Obtener color según estado
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
                return colors.text.secondary;
        }
    };

    // Obtener icono según estado
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
        <TouchableOpacity
            style={[styles.container, { backgroundColor: colors.background.secondary }]}
            onPress={handleContinueTrip}
        >
            {/* Indicador de estado */}
            <View style={[styles.statusBar, { backgroundColor: getStatusColor() }]} />

            <View style={styles.content}>
                {/* Icono y estado */}
                <View style={styles.statusSection}>
                    <View style={[styles.iconContainer, { backgroundColor: getStatusColor() + '20' }]}>
                        <Ionicons name={getStatusIcon() as any} size={20} color={getStatusColor()} />
                    </View>
                    <Text style={[styles.statusText, { color: getStatusColor() }]}>
                        {getStatusMessage()}
                    </Text>
                </View>

                {/* Detalles del viaje */}
                <View style={styles.tripDetails}>
                    {/* Origen y destino */}
                    <View style={styles.locations}>
                        <View style={styles.locationRow}>
                            <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                            <Text style={[styles.locationText, { color: colors.text.primary }]} numberOfLines={1}>
                                {trip.startLocation?.name || "Origen"}
                            </Text>
                        </View>

                        <View style={styles.locationRow}>
                            <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
                            <Text style={[styles.locationText, { color: colors.text.primary }]} numberOfLines={1}>
                                {trip.endLocation?.name || "Destino"}
                            </Text>
                        </View>
                    </View>

                    {/* Información del conductor si está disponible */}
                    {(trip.status === 'CONFIRMED' || trip.status === 'IN_PROGRESS') && trip.driver && (
                        <View style={styles.driverInfo}>
                            <Image
                                source={{ uri: trip.driver.profilePicture || 'https://placehold.co/100' }}
                                style={styles.driverPhoto}
                                defaultSource={require('@/assets/images/icon.png')}
                            />
                            <View style={styles.driverDetails}>
                                <Text style={[styles.driverName, { color: colors.text.primary }]}>
                                    {trip.driver.firstName} {trip.driver.lastName}
                                </Text>
                                {trip.vehicle && (
                                    <Text style={[styles.vehicleInfo, { color: colors.text.secondary }]}>
                                        {trip.vehicle.make} {trip.vehicle.model} • {trip.vehicle.plate}
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Botón de acción */}
                <View style={styles.actionSection}>
                    <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.primary }]}
                        onPress={handleContinueTrip}
                    >
                        <Text style={styles.actionButtonText}>Continuar</Text>
                        <Ionicons name="chevron-forward" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 12,
        overflow: 'hidden',
        marginHorizontal: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
    statusText: {
        fontSize: 14,
        fontWeight: '600',
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
    locationText: {
        fontSize: 14,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 12,
    },
    driverPhoto: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
        backgroundColor: '#e1e1e1',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 2,
    },
    vehicleInfo: {
        fontSize: 12,
    },
    actionSection: {
        alignItems: 'flex-end',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    actionButtonText: {
        color: 'white',
        fontWeight: '600',
        marginRight: 4,
    },
});

export default ActiveTripCard;