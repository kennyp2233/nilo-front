// components/maps/TripMap.tsx
import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Region, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import CenteredPin from './CenteredPin';
import { useTheme } from '@/theme/ThemeContext';

interface TripMapProps {
  origin?: { latitude: number; longitude: number, name?: string };
  destination?: { latitude: number; longitude: number, name?: string };
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
  const [mapReady, setMapReady] = useState(false);
  const initialOriginSet = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [useFallbackRoute, setUseFallbackRoute] = useState(false);

  // Get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Location permission not granted');
          return;
        }

        console.log("Getting current location...");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced
        });
        console.log("Current location received:", location.coords);
        setCurrentLocation(location);

        const initialRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };

        setRegion(initialRegion);

        // Only animate to region if map is ready
        if (mapRef.current && mapReady) {
          console.log("Animating to current location");
          mapRef.current.animateToRegion(initialRegion, 500);
        }
      } catch (error) {
        console.error('Error getting current location:', error);
      }
    })();
  }, [mapReady]);

  // Handle initial origin setting
  useEffect(() => {
    if (
      currentLocation &&
      !initialOriginSet.current &&
      onLocationSelected &&
      !origin &&
      !selectingType
    ) {
      console.log("Setting initial origin:", currentLocation.coords);
      onLocationSelected({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      initialOriginSet.current = true;
    }
  }, [currentLocation, origin, selectingType, onLocationSelected]);

  // Check if route is failing and activate fallback
  useEffect(() => {
    if (origin && destination && !route && !useFallbackRoute) {
      // If we have origin and destination but no route, activate fallback after a delay
      const timer = setTimeout(() => {
        console.log("Activating fallback route");
        setUseFallbackRoute(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [origin, destination, route, useFallbackRoute]);

  // Fit map to show both origin and destination
  useEffect(() => {
    if (origin && destination && mapRef.current && mapReady) {
      console.log("Fitting map to show origin and destination");
      mapRef.current.fitToCoordinates(
        [origin, destination],
        {
          edgePadding: {
            top: Platform.OS === 'ios' ? 100 : 50,
            right: Platform.OS === 'ios' ? 100 : 50,
            bottom: Platform.OS === 'ios' ? 300 : 250, // Increased to account for the bottom sheet
            left: Platform.OS === 'ios' ? 100 : 50
          },
          animated: true
        }
      );
    }
  }, [origin, destination, mapReady]);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);

    // Clear existing debounce timer if it exists
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    if (selectingType && onLocationSelected) {
      // Create new debounce timer
      debounceTimerRef.current = setTimeout(() => {
        console.log("Selecting location at center of map:", newRegion);
        onLocationSelected({
          latitude: newRegion.latitude,
          longitude: newRegion.longitude,
        });
      }, 500);
    }
  };

  // Extract route coordinates from the route object if available
  const getRouteCoordinates = () => {
    // If we're using fallback route, create a straight line between points
    if (useFallbackRoute && origin && destination) {
      // Create a simple direct line between origin and destination
      return [
        { latitude: origin.latitude, longitude: origin.longitude },
        { latitude: destination.latitude, longitude: destination.longitude }
      ];
    }

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

  const handleMapReady = () => {
    console.log("Map is ready");
    setMapReady(true);
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
        onMapReady={handleMapReady}
      >
        {origin && !selectingType && (
          <Marker
            coordinate={origin}
            pinColor="green"
            title="Origen"
            description={origin.name || "Punto de partida"}
          />
        )}
        {destination && !selectingType && (
          <Marker
            coordinate={destination}
            pinColor="red"
            title="Destino"
            description={destination.name || "Punto de llegada"}
          />
        )}

        {/* Display route if available or fallback */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeWidth={4}
            strokeColor={colors.primary}
            lineDashPattern={useFallbackRoute ? [5, 5] : undefined} // Dashed line for fallback
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