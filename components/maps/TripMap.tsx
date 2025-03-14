import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialOriginSet = useRef(false);

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

      // Si aún no se ha seteado el origin, se llama al callback
      if (!initialOriginSet.current && onLocationSelected) {
        onLocationSelected({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        initialOriginSet.current = true;
      }
    })();
  }, []);

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
