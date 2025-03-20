// src/components/ui/Text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';

interface TextProps extends RNTextProps {
    variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'title' | 'subtitle' | 'body' | 'caption' | 'button';
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success' | 'warning';
    align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
    style?: StyleProp<TextStyle>;
}

const Text: React.FC<TextProps> = ({
    children,
    variant = 'body',
    weight = 'normal',
    color = 'primary',
    align = 'auto',
    style,
    ...props
}) => {
    const { colors } = useTheme();

    // Determinar estilos según variante
    const getVariantStyles = (): TextStyle => {
        switch (variant) {
            case 'h1':
                return { fontSize: 32, lineHeight: 40 };
            case 'h2':
                return { fontSize: 28, lineHeight: 36 };
            case 'h3':
                return { fontSize: 24, lineHeight: 32 };
            case 'h4':
                return { fontSize: 20, lineHeight: 28 };
            case 'title':
                return { fontSize: 18, lineHeight: 24 };
            case 'subtitle':
                return { fontSize: 16, lineHeight: 22 };
            case 'body':
                return { fontSize: 14, lineHeight: 20 };
            case 'caption':
                return { fontSize: 12, lineHeight: 16 };
            case 'button':
                return { fontSize: 16, lineHeight: 20 };
            default:
                return { fontSize: 14, lineHeight: 20 };
        }
    };

    // Determinar peso de fuente
    const getWeightStyles = (): TextStyle => {
        switch (weight) {
            case 'normal':
                return { fontWeight: '400' };
            case 'medium':
                return { fontWeight: '500' };
            case 'semibold':
                return { fontWeight: '600' };
            case 'bold':
                return { fontWeight: '700' };
            default:
                return { fontWeight: '400' };
        }
    };

    // Determinar color
    const getColorStyles = (): TextStyle => {
        switch (color) {
            case 'primary':
                return { color: colors.text.primary };
            case 'secondary':
                return { color: colors.text.secondary };
            case 'tertiary':
                return { color: colors.text.tertiary };
            case 'accent':
                return { color: colors.primary };
            case 'error':
                return { color: colors.error };
            case 'success':
                return { color: colors.success };
            case 'warning':
                return { color: colors.warning };
            default:
                return { color: colors.text.primary };
        }
    };

    // Alineación del texto
    const getAlignStyles = (): TextStyle => {
        return { textAlign: align };
    };

    return (
        <RNText
            style={[
                getVariantStyles(),
                getWeightStyles(),
                getColorStyles(),
                getAlignStyles(),
                style,
            ]}
            {...props}
        >
            {children}
        </RNText>
    );
};

export default Text;