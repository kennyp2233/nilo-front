// src/components/ui/Input.tsx
import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    ViewStyle,
    TextStyle,
    StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

export interface InputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    iconColor?: string;
    error?: string;
    helper?: string;
    suffix?: React.ReactNode;
    prefix?: React.ReactNode;
    containerStyle?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    variant?: 'outlined' | 'filled' | 'underlined';
    secureTextToggle?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    icon,
    iconPosition = 'left',
    iconColor,
    error,
    helper,
    suffix,
    prefix,
    containerStyle,
    inputStyle,
    variant = 'outlined',
    secureTextToggle = false,
    onFocus,
    onBlur,
    style,
    secureTextEntry,
    ...props
}) => {
    const { colors } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(!secureTextEntry);

    // Manejar eventos de foco
    const handleFocus = (event: any) => {
        setIsFocused(true);
        onFocus?.(event);
    };

    const handleBlur = (event: any) => {
        setIsFocused(false);
        onBlur?.(event);
    };

    // Determinar estilos según la variante
    const getVariantStyles = (): ViewStyle => {
        const baseStyle: ViewStyle = {
            flexDirection: 'row',
            alignItems: 'center',
            borderRadius: variant === 'underlined' ? 0 : 8,
        };

        switch (variant) {
            case 'outlined':
                return {
                    ...baseStyle,
                    borderWidth: 1,
                    borderColor: error
                        ? colors.error
                        : isFocused
                            ? colors.primary
                            : colors.border,
                    backgroundColor: 'transparent',
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                };
            case 'filled':
                return {
                    ...baseStyle,
                    borderWidth: 0,
                    backgroundColor: error
                        ? `${colors.error}20`
                        : isFocused
                            ? `${colors.primary}10`
                            : colors.background.secondary,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                };
            case 'underlined':
                return {
                    ...baseStyle,
                    borderBottomWidth: 1,
                    borderColor: error
                        ? colors.error
                        : isFocused
                            ? colors.primary
                            : colors.border,
                    backgroundColor: 'transparent',
                    paddingHorizontal: 0,
                    paddingVertical: 8,
                };
            default:
                return baseStyle;
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text
                    variant="subtitle"
                    color={error ? 'error' : 'secondary'}
                    style={styles.label}
                >
                    {label}
                </Text>
            )}

            <View style={[styles.inputContainer, getVariantStyles()]}>
                {icon && iconPosition === 'left' && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={iconColor || error ? colors.error : isFocused ? colors.primary : colors.text.secondary}
                        style={styles.leftIcon}
                    />
                )}

                {prefix}

                <TextInput
                    style={[
                        styles.input,
                        {
                            color: colors.text.primary,
                            flex: 1,
                        },
                        inputStyle,
                    ]}
                    placeholderTextColor={colors.text.tertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    secureTextEntry={secureTextToggle ? !showPassword : secureTextEntry}
                    {...props}
                />

                {suffix}

                {icon && iconPosition === 'right' && !secureTextToggle && (
                    <Ionicons
                        name={icon}
                        size={20}
                        color={iconColor || error ? colors.error : isFocused ? colors.primary : colors.text.secondary}
                        style={styles.rightIcon}
                    />
                )}

                {secureTextToggle && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={20}
                            color={colors.text.secondary}
                            style={styles.rightIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {(error || helper) && (
                <Text
                    variant="caption"
                    color={error ? 'error' : 'tertiary'}
                    style={styles.helperText}
                >
                    {error || helper}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        marginBottom: 8,
    },
    inputContainer: {
        width: '100%',
    },
    input: {
        fontSize: 16,
        paddingVertical: 0,
    },
    leftIcon: {
        marginRight: 8,
    },
    rightIcon: {
        marginLeft: 8,
    },
    helperText: {
        marginTop: 4,
    },
});

export default Input;