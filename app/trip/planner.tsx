import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TripMap from '@/components/maps/TripMap';
import TripSheet from '@/components/trips/TripSheet';
import { LocationService } from '@/services/location.service';

const TripPlanner = () => {
    const [expanded, setExpanded] = useState(false);
    const [origin, setOrigin] = useState<any | null>(null);
    const [destination, setDestination] = useState<any | null>(null);
    const [selectingType, setSelectingType] = useState<'origin' | 'destination' | null>(null);

    const handleLocationSelected = async (coords: { latitude: number; longitude: number }) => {
        try {
            const location = await LocationService.reverseGeocode(coords.latitude, coords.longitude);
            if (location) {
                if (selectingType === 'origin') {
                    setOrigin(location);
                } else {
                    setDestination(location);
                }
                setSelectingType(null);
                setExpanded(true);
            }
        } catch (error) {
            console.error('Error getting location from coordinates:', error);
        }
    };

    const handleLocationSelect = async (
        type: 'origin' | 'destination',
        location: any | null
    ) => {
        if (location) {
            // Si se seleccionó una ubicación desde la búsqueda
            if (type === 'origin') {
                setOrigin(location);
            } else {
                setDestination(location);
            }
        } else {
            // Si se va a seleccionar en el mapa
            setSelectingType(type);
            setExpanded(false);
        }
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <TripMap
                origin={origin ? { latitude: origin.latitude, longitude: origin.longitude } : undefined}
                destination={destination ? { latitude: destination.latitude, longitude: destination.longitude } : undefined}
                onLocationSelected={handleLocationSelected}
                selectingType={selectingType}
            />
            <TripSheet
                expanded={expanded}
                onExpandedChange={setExpanded}
                onLocationSelect={handleLocationSelect}
                origin={origin}
                destination={destination}
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