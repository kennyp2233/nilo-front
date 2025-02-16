// src/components/maps/CenteredPin.tsx
import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface CenteredPinProps {
  color?: string;
}

const CenteredPin: React.FC<CenteredPinProps> = ({ color = '#000' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.pinContainer}>
        <View style={[styles.pin, { backgroundColor: color }]} />
        <View style={[styles.pinShadow, { backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  pinContainer: {
    width: 20,
    height: 20,
    marginBottom: 20, // Offset to account for pin point
  },
  pin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    position: 'absolute',
  },
  pinShadow: {
    width: 4,
    height: 4,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: -12,
    left: 8,
    borderRadius: 2,
  },
});

export default CenteredPin;
