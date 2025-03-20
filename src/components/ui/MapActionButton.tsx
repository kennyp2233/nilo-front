// src/components/maps/MapActionButton.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';

interface MapActionButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    position?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
    style?: StyleProp<ViewStyle>;
    size?: 'small' | 'medium' | 'large';
    color?: string;
    disabled?: boolean;
}

const MapActionButton: React.FC<MapActionButtonProps> = ({
    icon,
    onPress,
    position = 'topRight',
    style,
    size = 'medium',
    color,
    disabled = false,
}) => {
    const { colors, isDark } = useTheme();

    // Determinar tamaño del botón y del icono
    const getButtonSize = (): { buttonSize: number; iconSize: number } => {
        switch (size) {
            case 'small':
                return { buttonSize: 36, iconSize: 18 };
            case 'medium':
                return { buttonSize: 44, iconSize: 22 };
            case 'large':
                return { buttonSize: 56, iconSize: 28 };
            default:
                return { buttonSize: 44, iconSize: 22 };
        }
    };

    // Determinar posición
    const getPositionStyle = (): ViewStyle => {
        switch (position) {
            case 'topLeft':
                return { top: 16, left: 16 };
            case 'topRight':
                return { top: 16, right: 16 };
            case 'bottomLeft':
                return { bottom: 16, left: 16 };
            case 'bottomRight':
                return { bottom: 16, right: 16 };
            default:
                return { top: 16, right: 16 };
        }
    };

    const { buttonSize, iconSize } = getButtonSize();
    const buttonColor = color || colors.primary;

    return (
        <TouchableOpacity
            style={[
                styles.button,
                {
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: buttonSize / 2,
                    backgroundColor: isDark ? colors.background.secondary : 'white',
                },
                getPositionStyle(),
                disabled && { opacity: 0.5 },
                style,
            ]}
            onPress={onPress}
            disabled={disabled}
            activeOpacity={0.8}
        >
            <Ionicons name={icon} size={iconSize} color={buttonColor} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    },
});

export default MapActionButton;