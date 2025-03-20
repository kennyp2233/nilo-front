// src/components/ui/Button.tsx
import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
    StyleProp
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle
}) => {
    const { colors } = useTheme();

    // Determinar estilos según la variante
    const getButtonStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                };
            case 'secondary':
                return {
                    backgroundColor: colors.secondary,
                    borderColor: colors.secondary,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderColor: colors.primary,
                    borderWidth: 1,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    borderColor: 'transparent',
                };
            case 'danger':
                return {
                    backgroundColor: colors.error,
                    borderColor: colors.error,
                };
            default:
                return {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                };
        }
    };

    // Determinar estilos de texto según la variante
    const getTextStyles = (): TextStyle => {
        switch (variant) {
            case 'primary':
            case 'secondary':
            case 'danger':
                return { color: 'white' };
            case 'outline':
                return { color: colors.primary };
            case 'ghost':
                return { color: colors.primary };
            default:
                return { color: 'white' };
        }
    };

    // Determinar tamaño del botón
    const getSizeStyles = (): ViewStyle => {
        switch (size) {
            case 'small':
                return {
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                };
            case 'medium':
                return {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                };
            case 'large':
                return {
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                };
            default:
                return {
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                };
        }
    };

    // Tamaño del icono según el tamaño del botón
    const getIconSize = (): number => {
        switch (size) {
            case 'small':
                return 16;
            case 'medium':
                return 20;
            case 'large':
                return 24;
            default:
                return 20;
        }
    };

    // Estilo cuando está deshabilitado
    const disabledStyle: ViewStyle = disabled
        ? { opacity: 0.6 }
        : {};

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={[
                styles.button,
                getButtonStyles(),
                getSizeStyles(),
                fullWidth && styles.fullWidth,
                disabledStyle,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'outline' || variant === 'ghost' ? colors.primary : 'white'}
                    size={getIconSize()}
                />
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <Ionicons
                            name={icon}
                            size={getIconSize()}
                            color={getTextStyles().color as string}
                            style={styles.leftIcon}
                        />
                    )}
                    <Text style={[styles.buttonText, getTextStyles(), textStyle]}>
                        {title}
                    </Text>
                    {icon && iconPosition === 'right' && (
                        <Ionicons
                            name={icon}
                            size={getIconSize()}
                            color={getTextStyles().color as string}
                            style={styles.rightIcon}
                        />
                    )}
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    fullWidth: {
        width: '100%',
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
});

export default Button;