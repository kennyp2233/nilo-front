// src/components/trips/details/StatusBar.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBarProps {
    statusText: string;
    statusColor: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ statusText, statusColor }) => {
    return (
        <View style={[styles.statusBar, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    statusBar: {
        padding: 12,
        alignItems: "center",
    },
    statusText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
});

export default StatusBar;