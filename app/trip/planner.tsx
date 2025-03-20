// app/trip/planner.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '@/src/theme/ThemeContext';
import { useLocation } from '@/src/hooks/useLocation';
import { useTrip } from '@/src/hooks/useTrip';
import { Location } from '@/src/stores/locationStore';
import TripMap from '@/src/components/maps/TripMap';
import TripSheet from '@/src/components/trips/TripSheet';
import {
    Header,
    MapActionButton,
    LoadingOverlay,
    Toast,
    useToast
} from '@/src/components/ui';

const TripPlanner = () => {
    const { colors } = useTheme();
    const toast = useToast();
    const [expanded, setExpanded] = useState(false);
    const [selectingType, setSelectingType] = useState<'origin' | 'destination' | null>(null);

    // Get location and trip hooks
    const {
        getLocationFromCoordinates,
        handleLocationSelect,
        calculateRoute
    } = useLocation();

    const {
        origin,
        destination,
        setOrigin,
        setDestination,
        createTrip,
        isLoading,
        error,
        route,
        clearError,
        routeError
    } = useTrip();

    // Show error if any
    useEffect(() => {
        if (error) {
            toast.error(error);
            clearError();
        }
    }, [error]);

    // Show route error toast
    useEffect(() => {
        if (routeError) {
            toast.warning('No se pudo calcular la ruta. Utilizando estimación alternativa.');
        }
    }, [routeError]);

    // Calculate route when origin and destination are set
    useEffect(() => {
        const fetchRouteData = async () => {
            if (origin && destination) {
                try {
                    await calculateRoute(origin, destination);
                } catch (error) {
                    console.error('Error calculating route:', error);
                }
            }
        };

        fetchRouteData();
    }, [origin, destination]);

    // Handle map location selected
    const handleMapLocationSelected = async (coords: { latitude: number; longitude: number }) => {
        try {
            const location = await getLocationFromCoordinates(coords);

            if (location) {
                if (selectingType === 'origin') {
                    setOrigin(location);
                    setSelectingType(null);
                    setExpanded(true);
                    toast.success('Origen seleccionado');
                } else if (selectingType === 'destination') {
                    setDestination(location);
                    setSelectingType(null);
                    setExpanded(true);
                    toast.success('Destino seleccionado');
                } else if (!origin) {
                    setOrigin(location);
                }
            } else {
                toast.error("No se pudo obtener la ubicación. Por favor, intenta de nuevo.");
            }
        } catch (error) {
            toast.error("Ocurrió un error al obtener la ubicación.");
        }
    };

    // Handle location selection from search or recent
    const handleLocationSelection = async (
        type: 'origin' | 'destination',
        location: Location | null
    ) => {
        if (location) {
            // Location selected from search or recents
            if (type === 'origin') {
                setOrigin(location);
                await handleLocationSelect(location);
            } else {
                setDestination(location);
                await handleLocationSelect(location);
            }
            setSelectingType(null);
        } else {
            // User wants to select on map
            setSelectingType(type);
            setExpanded(false);
        }
    };

    // Reset map view to current location
    const handleResetLocation = () => {
        // This would use the map ref to animate to user's current location
        // Implementation depends on your map component
    };

    // Request a trip
    const handleRequestTrip = async () => {
        if (!origin || !destination) {
            toast.warning('Por favor, especifica origen y destino');
            return;
        }

        try {
            const trip = await createTrip();
            if (trip) {
                toast.success('¡Solicitud de viaje enviada con éxito!');
            }
        } catch (error) {
            toast.error('No se pudo crear el viaje. Por favor, intenta de nuevo.');
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <Header
                title="Planificar viaje"
                showBackButton

                statusBarStyle="dark-content"
                fixed
            />

            <TripMap
                origin={origin ? {
                    latitude: origin.latitude,
                    longitude: origin.longitude,
                    name: origin.name || ''
                } : undefined}
                destination={destination ? {
                    latitude: destination.latitude,
                    longitude: destination.longitude,
                    name: destination.name || ''
                } : undefined}
                onLocationSelected={handleMapLocationSelected}
                selectingType={selectingType}
                route={route}
            />

            {/* Map action buttons */}
            <MapActionButton
                icon="locate"
                position="topRight"
                onPress={handleResetLocation}
                style={{ top: 80 }}
            />

            {selectingType && (
                <View style={styles.selectingModeView}>
                    <MapActionButton
                        icon="close-circle"
                        position="topLeft"
                        color={colors.error}
                        onPress={() => setSelectingType(null)}
                        style={{ top: 80 }}
                    />
                </View>
            )}

            <TripSheet
                expanded={expanded}
                onExpandedChange={setExpanded}
                onLocationSelect={handleLocationSelection}
                origin={origin}
                destination={destination}
                onRequestTrip={handleRequestTrip}
                isLoading={isLoading}
            />

            <LoadingOverlay
                visible={isLoading}
                text="Procesando solicitud..."
            />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    selectingModeView: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    }
});

export default TripPlanner;