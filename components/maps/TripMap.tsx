// src/components/maps/TripMap.tsx
import React, { useRef, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import CenteredPin from './CenteredPin';

interface TripMapProps {
  origin?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  onLocationSelected?: (coords: { latitude: number; longitude: number }) => void;
  selectingType?: 'origin' | 'destination' | null;
}

const TripMap: React.FC<TripMapProps> = ({
  origin,
  destination,
  onLocationSelected,
  selectingType,
}) => {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = React.useState<Location.LocationObject | null>(null);
  const [region, setRegion] = React.useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

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
    })();
  }, []);

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const handleRegionChangeComplete = async (newRegion: Region) => {
    if (selectingType && onLocationSelected) {
      onLocationSelected({
        latitude: newRegion.latitude,
        longitude: newRegion.longitude,
      });
    }
  };

  const initialRegion = {
    latitude: currentLocation?.coords.latitude ?? -0.1806532,
    longitude: currentLocation?.coords.longitude ?? -78.4678382,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

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
      >
        {origin && !selectingType && (
          <Marker coordinate={origin} pinColor="green" />
        )}
        {destination && !selectingType && (
          <Marker coordinate={destination} pinColor="red" />
        )}
      </MapView>
      {selectingType && (
        <CenteredPin color={selectingType === 'origin' ? '#4CAF50' : '#F44336'} />
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