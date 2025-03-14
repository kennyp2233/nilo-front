import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Marker, Region, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import CenteredPin from './CenteredPin';
import { useTheme } from '@/theme/ThemeContext';

interface TripMapProps {
  origin?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  onLocationSelected?: (coords: { latitude: number; longitude: number }) => void;
  selectingType?: 'origin' | 'destination' | null;
  route?: any;
}

const TripMap: React.FC<TripMapProps> = ({
  origin,
  destination,
  onLocationSelected,
  selectingType,
  route
}) => {
  const { colors } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialOriginSet = useRef(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);

        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setRegion(initialRegion);
        mapRef.current?.animateToRegion(initialRegion);

        // If origin is not set yet, call the callback
        if (!initialOriginSet.current && onLocationSelected) {
          onLocationSelected({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          initialOriginSet.current = true;
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    })();
  }, []);

  // Fit map to show both origin and destination
  useEffect(() => {
    if (origin && destination && mapRef.current) {
      mapRef.current.fitToCoordinates(
        [origin, destination],
        {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true
        }
      );
    }
  }, [origin, destination]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    if (selectingType && onLocationSelected) {
      timeoutRef.current = setTimeout(() => {
        onLocationSelected({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
        });
      }, 500);
    }
  };

  // Extract route coordinates from the route object if available
  const getRouteCoordinates = () => {
    if (!route || !route.routes || !route.routes[0] || !route.routes[0].geometry) {
      return [];
    }

    // Parse the route geometry (assuming it's in the format provided by the OpenRouteService)
    try {
      const coordinates = route.routes[0].geometry.coordinates.map((coord: [number, number]) => ({
        latitude: coord[1], // ORS returns [longitude, latitude]
        longitude: coord[0]
      }));

      return coordinates;
    } catch (error) {
      console.error('Error parsing route geometry:', error);
      return [];
    }
  };

  const initialRegion = {
    latitude: currentLocation?.coords.latitude ?? -0.1806532,
    longitude: currentLocation?.coords.longitude ?? -78.4678382,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  const routeCoordinates = getRouteCoordinates();

  return (
    <>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        onRegionChange={handleRegionChange}
        onRegionChangeComplete={handleRegionChangeComplete}
        provider={PROVIDER_GOOGLE}
      >
        {origin && !selectingType && (
          <Marker coordinate={origin} pinColor="green" />
        )}
        {destination && !selectingType && (
          <Marker coordinate={destination} pinColor="red" />
        )}

        {/* Display route if available */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={colors.primary}
          />
        )}
      </MapView>

      {selectingType && (
        <CenteredPin color={selectingType === 'origin' ? colors.success : colors.error} />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default TripMap;