// src/components/ui/NotificationIcon.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Badge from './Badge';

interface NotificationIconProps {
    iconName: keyof typeof Ionicons.glyphMap;
    count?: number;
    size?: number;
    color?: string;
    badgeColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
    onPress?: () => void;
    maxCount?: number;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
    iconName,
    count = 0,
    size = 24,
    color,
    badgeColor = 'error',
    onPress,
    maxCount = 99,
}) => {
    const { colors } = useTheme();
    const iconColor = color || colors.text.primary;

    // Formatear contador para números grandes
    const formatCount = (count: number): string | number => {
        if (count > maxCount) {
            return `${maxCount}+`;
        }
        return count;
    };

    const IconComponent = onPress ? TouchableOpacity : View;
    const additionalProps = onPress ? { onPress } : {};

    return (
        <IconComponent style={styles.container} {...additionalProps}>
            <Ionicons name={iconName} size={size} color={iconColor} />

            {count > 0 && (
                <View style={styles.badgeContainer}>
                    <Badge
                        variant="default"
                        size="small"
                        color={badgeColor}
                        label={formatCount(count)}
                    />
                </View>
            )}
        </IconComponent>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        padding: 4, // Área de toque extendida
    },
    badgeContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
});

export default NotificationIcon;