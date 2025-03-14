import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TripMap from '@/components/maps/TripMap';
import TripSheet from '@/components/trips/TripSheet';
import { LocationService } from '@/services/location.service';
import { debounce } from 'lodash';

const TripPlanner = () => {
    const [expanded, setExpanded] = useState(false);
    const [origin, setOrigin] = useState<any | null>(null);
    const [destination, setDestination] = useState<any | null>(null);
    const [selectingType, setSelectingType] = useState<'origin' | 'destination' | null>(null);


    const debouncedHandleLocationSelected = debounce(
        async (coords: { latitude: number; longitude: number }) => {
            try {
                const location = await LocationService.reverseGeocode(coords.latitude, coords.longitude);
                if (location) {
                    // Si se está seleccionando "origin" o, en la carga inicial (selectingType es null y origin no está seteado),
                    // asumimos que se quiere definir el origin.
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
        },
        500, // espera 500ms después de la última acción
        { leading: false, trailing: true }
    );

    const handleLocationSelected = async (coords: { latitude: number; longitude: number }) => {
        // 🚀 Si es la PRIMERA VEZ, no usar debounce
        if (!selectingType && !origin) {
            try {
                const location = await LocationService.reverseGeocode(coords.latitude, coords.longitude);
                if (location) {
                    setOrigin(location);
                }
            } catch (error) {
                console.error('Error getting location from coordinates:', error);
            }
            return; // 🔥 Evita que pase por el debounce
        }

        // 🚀 Si es una selección en el mapa, usar debounce
        debouncedHandleLocationSelected(coords);
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