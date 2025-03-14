import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TripMap from '@/src/components/maps/TripMap';
import TripSheet from '@/src/components/trips/TripSheet';
import { useLocation } from '@/src/hooks/useLocation';
import { useTrip } from '@/src/hooks/useTrip';
import { Location } from '@/src/stores/locationStore';
import { useTheme } from '@/src/theme/ThemeContext';

const TripPlanner = () => {
    const { colors } = useTheme();
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
        clearError
    } = useTrip();


    // Show error if any
    useEffect(() => {
        if (error) {
            Alert.alert('Error', error);
            clearError();
        }
    }, [error]);

    // Calculate route when origin and destination are set
    useEffect(() => {
        const fetchRouteData = async () => {
            if (origin && destination) {
                try {
                    console.log("Calculating route for", origin, destination);
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
            console.log("Map location selected:", coords);
            const location = await getLocationFromCoordinates(coords);

            if (location) {
                if (selectingType === 'origin') {
                    console.log("Setting origin from map selection:", location);
                    setOrigin(location);
                    setSelectingType(null);
                    setExpanded(true);
                } else if (selectingType === 'destination') {
                    console.log("Setting destination from map selection:", location);
                    setDestination(location);
                    setSelectingType(null);
                    setExpanded(true);
                } else if (!origin) {
                    console.log("Setting initial origin:", location);
                    setOrigin(location);
                }
            } else {
                console.error("Failed to get location from coordinates");
                Alert.alert("Error", "No se pudo obtener la ubicación. Por favor, intenta de nuevo.");
            }
        } catch (error) {
            console.error('Error getting location from coordinates:', error);
            Alert.alert("Error", "Ocurrió un error al obtener la ubicación.");
        }
    };

    // Handle location selection from search or recent
    const handleLocationSelection = async (
        type: 'origin' | 'destination',
        location: Location | null
    ) => {
        console.log(`Location selection for ${type}:`, location);

        if (location) {
            // Location selected from search or recents
            if (type === 'origin') {
                console.log("Setting origin from search:", location);
                setOrigin(location);
                await handleLocationSelect(location);
            } else {
                console.log("Setting destination from search:", location);
                setDestination(location);
                await handleLocationSelect(location);
            }
            setSelectingType(null);
        } else {
            // User wants to select on map
            console.log("Switching to map selection for:", type);
            setSelectingType(type);
            setExpanded(false);
        }
    };

    // Request a trip
    const handleRequestTrip = async () => {
        if (!origin || !destination) {
            Alert.alert('Error', 'Por favor, especifica origen y destino');
            return;
        }

        try {
            console.log("Requesting trip:", { origin, destination });
            const trip = await createTrip();
            if (trip) {
                Alert.alert('Éxito', '¡Solicitud de viaje enviada con éxito!');
            }
        } catch (error) {
            console.error('Error creating trip:', error);
            Alert.alert('Error', 'No se pudo crear el viaje. Por favor, intenta de nuevo.');
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
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
            <TripSheet
                expanded={expanded}
                onExpandedChange={setExpanded}
                onLocationSelect={handleLocationSelection}
                origin={origin}
                destination={destination}
                onRequestTrip={handleRequestTrip}
                isLoading={isLoading}
            />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default TripPlanner;