import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TripMap from '@/components/maps/TripMap';
import TripSheet from '@/components/trips/TripSheet';
import { useLocation } from '@/hooks/useLocation';
import { useTrip } from '@/hooks/useTrip';
import { Location } from '@/stores/locationStore';
import { useTheme } from '@/theme/ThemeContext';

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
                    await calculateRoute(origin, destination);
                } catch (error) {
                    console.error('Error calculating route:', error);
                }
            }
        };

        fetchRouteData();
    }, [origin, destination]);

    // Handle map location selection
    const handleMapLocationSelected = async (coords: { latitude: number; longitude: number }) => {
        try {
            const location = await getLocationFromCoordinates(coords);

            if (location) {
                if (selectingType === 'origin' || (!selectingType && !origin)) {
                    setOrigin(location);
                } else if (selectingType === 'destination' || (!selectingType && !destination)) {
                    setDestination(location);
                }

                setSelectingType(null);
                setExpanded(true);
            }
        } catch (error) {
            console.error('Error getting location from coordinates:', error);
        }
    };

    // Handle location selection from search or recent locations
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

    // Request a trip
    const handleRequestTrip = async () => {
        if (!origin || !destination) {
            Alert.alert('Error', 'Please set both origin and destination');
            return;
        }

        try {
            const trip = await createTrip();
            if (trip) {
                Alert.alert('Success', 'Trip request sent successfully!');
            }
        } catch (error) {
            console.error('Error creating trip:', error);
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <TripMap
                origin={origin ? { latitude: origin.latitude, longitude: origin.longitude } : undefined}
                destination={destination ? { latitude: destination.latitude, longitude: destination.longitude } : undefined}
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