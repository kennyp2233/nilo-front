// src/components/ui/Card.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
    StyleProp
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'elevated' | 'outline' | 'flat';
    padding?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
    children,
    onPress,
    style,
    variant = 'default',
    padding = 'medium'
}) => {
    const { colors, isDark } = useTheme();

    // Determinar estilos según la variante
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'default':
                return {
                    backgroundColor: colors.background.secondary,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: isDark ? 0.3 : 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                };
            case 'elevated':
                return {
                    backgroundColor: colors.background.secondary,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.4 : 0.2,
                    shadowRadius: 8,
                    elevation: 6,
                };
            case 'outline':
                return {
                    backgroundColor: colors.background.secondary,
                    borderWidth: 1,
                    borderColor: colors.border,
                    shadowColor: 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    elevation: 0,
                };
            case 'flat':
                return {
                    backgroundColor: colors.background.secondary,
                    shadowColor: 'transparent',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0,
                    shadowRadius: 0,
                    elevation: 0,
                };
            default:
                return {
                    backgroundColor: colors.background.secondary,
                };
        }
    };

    // Determinar el padding
    const getPaddingStyles = (): ViewStyle => {
        switch (padding) {
            case 'none':
                return { padding: 0 };
            case 'small':
                return { padding: 8 };
            case 'medium':
                return { padding: 16 };
            case 'large':
                return { padding: 24 };
            default:
                return { padding: 16 };
        }
    };

    // Componente base como View o TouchableOpacity
    const CardComponent = onPress ? TouchableOpacity : View;
    const additionalProps = onPress ? { onPress } : {};

    return (
        <CardComponent
            style={[
                styles.card,
                getVariantStyles(),
                getPaddingStyles(),
                style,
            ]}
            {...additionalProps}
        >
            {children}
        </CardComponent>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 8,
    },
});

export default Card;