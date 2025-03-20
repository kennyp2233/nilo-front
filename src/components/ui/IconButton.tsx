// src/components/ui/IconButton.tsx
import React from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    StyleProp,
    View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';
import Badge from './Badge';

interface IconButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    size?: 'small' | 'medium' | 'large';
    variant?: 'filled' | 'outlined' | 'ghost';
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
    label?: string;
    labelPosition?: 'bottom' | 'right';
    badge?: number | boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    customColor?: string;
    round?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onPress,
    size = 'medium',
    variant = 'ghost',
    color = 'primary',
    label,
    labelPosition = 'bottom',
    badge,
    disabled = false,
    style,
    customColor,
    round = false,
}) => {
    const { colors } = useTheme();

    // Get icon size based on component size
    const getIconSize = (): number => {
        switch (size) {
            case 'small':
                return 16;
            case 'medium':
                return 24;
            case 'large':
                return 32;
            default:
                return 24;
        }
    };

    // Get button size based on component size
    const getButtonSize = (): number => {
        switch (size) {
            case 'small':
                return 32;
            case 'medium':
                return 44;
            case 'large':
                return 56;
            default:
                return 44;
        }
    };

    // Get color based on type
    const getColor = (): string => {
        if (customColor) return customColor;

        switch (color) {
            case 'primary':
                return colors.primary;
            case 'secondary':
                return colors.secondary;
            case 'success':
                return colors.success;
            case 'warning':
                return colors.warning;
            case 'error':
                return colors.error;
            case 'neutral':
                return colors.text.secondary;
            default:
                return colors.primary;
        }
    };

    // Get background and border styles based on variant
    const getVariantStyles = (): ViewStyle => {
        const buttonColor = getColor();

        switch (variant) {
            case 'filled':
                return {
                    backgroundColor: buttonColor,
                    borderWidth: 0,
                };
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: buttonColor,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
            default:
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                };
        }
    };

    // Get icon color based on variant
    const getIconColor = (): string => {
        const buttonColor = getColor();

        switch (variant) {
            case 'filled':
                return '#FFFFFF';
            case 'outlined':
            case 'ghost':
                return buttonColor;
            default:
                return buttonColor;
        }
    };

    const iconSize = getIconSize();
    const buttonSize = getButtonSize();
    const variantStyles = getVariantStyles();
    const iconColor = getIconColor();

    return (
        <View style={[
            styles.container,
            label && labelPosition === 'bottom' && styles.containerVertical,
            label && labelPosition === 'right' && styles.containerHorizontal,
        ]}>
            <TouchableOpacity
                style={[
                    styles.button,
                    {
                        width: buttonSize,
                        height: buttonSize,
                        borderRadius: round ? buttonSize / 2 : 8,
                    },
                    variantStyles,
                    disabled && styles.disabled,
                    style,
                ]}
                onPress={onPress}
                disabled={disabled}
                activeOpacity={0.7}
            >
                <Ionicons name={icon} size={iconSize} color={iconColor} />

                {/* Badge */}
                {badge && (
                    <View style={styles.badgeContainer}>
                        {typeof badge === 'number' ? (
                            <Badge
                                label={badge > 99 ? '99+' : badge}
                                variant="default"
                                size="small"
                                color="error"
                            />
                        ) : (
                            <View style={[styles.dotBadge, { backgroundColor: colors.error }]} />
                        )}
                    </View>
                )}
            </TouchableOpacity>

            {/* Label */}
            {label && (
                <Text
                    variant="caption"
                    style={[
                        styles.label,
                        labelPosition === 'right' && styles.rightLabel,
                        { color: disabled ? colors.text.tertiary : colors.text.secondary }
                    ]}
                >
                    {label}
                </Text>
            )}
        </View>
    );
};

export default IconButton;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    containerVertical: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    containerHorizontal: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    disabled: {
        opacity: 0.5,
    },
    badgeContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
    },
    dotBadge: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    label: {
        marginTop: 4,
        fontSize: 12,
    },
    rightLabel: {
        marginLeft: 8,
        marginTop: 0,
    },
});