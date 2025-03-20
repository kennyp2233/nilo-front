// src/components/ui/Divider.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

interface DividerProps {
    orientation?: 'horizontal' | 'vertical';
    size?: 'thin' | 'medium' | 'thick';
    style?: StyleProp<ViewStyle>;
    color?: string;
    margin?: 'none' | 'small' | 'medium' | 'large';
}

const Divider: React.FC<DividerProps> = ({
    orientation = 'horizontal',
    size = 'thin',
    style,
    color,
    margin = 'medium'
}) => {
    const { colors } = useTheme();

    // Determinar el grosor
    const getSize = (): number => {
        switch (size) {
            case 'thin':
                return 1;
            case 'medium':
                return 2;
            case 'thick':
                return 4;
            default:
                return 1;
        }
    };

    // Determinar los márgenes
    const getMarginStyles = (): ViewStyle => {
        switch (margin) {
            case 'none':
                return { margin: 0 };
            case 'small':
                return orientation === 'horizontal' ? { marginVertical: 8 } : { marginHorizontal: 8 };
            case 'medium':
                return orientation === 'horizontal' ? { marginVertical: 16 } : { marginHorizontal: 16 };
            case 'large':
                return orientation === 'horizontal' ? { marginVertical: 24 } : { marginHorizontal: 24 };
            default:
                return orientation === 'horizontal' ? { marginVertical: 16 } : { marginHorizontal: 16 };
        }
    };

    // Determinar estilo según orientación
    const getOrientationStyles = (): ViewStyle => {
        const thickness = getSize();
        return orientation === 'horizontal'
            ? { height: thickness, width: '100%' }
            : { width: thickness, height: '100%' };
    };

    return (
        <View
            style={[
                styles.divider,
                getOrientationStyles(),
                getMarginStyles(),
                { backgroundColor: color || colors.border },
                style,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    divider: {
        flexShrink: 0,
    },
});

export default Divider;