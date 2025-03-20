// src/components/ui/FloatingActionButton.tsx
import React, { useState } from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    StyleProp,
    View,
    Animated,
    Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';

interface ActionItem {
    icon: keyof typeof Ionicons.glyphMap;
    label?: string;
    onPress: () => void;
    color?: string;
}

interface FABProps {
    icon?: keyof typeof Ionicons.glyphMap;
    actions?: ActionItem[];
    onPress?: () => void;
    position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
    color?: string;
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    extended?: boolean;
    label?: string;
    style?: StyleProp<ViewStyle>;
}

const FloatingActionButton: React.FC<FABProps> = ({
    icon = 'add',
    actions,
    onPress,
    position = 'bottomRight',
    color,
    size = 'medium',
    disabled = false,
    extended = false,
    label,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const [open, setOpen] = useState(false);
    const animation = React.useRef(new Animated.Value(0)).current;

    // Get button size based on size prop
    const getButtonSize = (): { size: number; iconSize: number } => {
        switch (size) {
            case 'small':
                return { size: 40, iconSize: 18 };
            case 'medium':
                return { size: 56, iconSize: 24 };
            case 'large':
                return { size: 64, iconSize: 32 };
            default:
                return { size: 56, iconSize: 24 };
        }
    };

    // Get position styles
    const getPositionStyle = (): ViewStyle => {
        const margin = 16;

        switch (position) {
            case 'bottomRight':
                return { bottom: margin, right: margin };
            case 'bottomLeft':
                return { bottom: margin, left: margin };
            case 'topRight':
                return { top: margin, right: margin };
            case 'topLeft':
                return { top: margin, left: margin };
            default:
                return { bottom: margin, right: margin };
        }
    };

    // Handle main button press
    const handlePress = () => {
        if (actions && actions.length > 0) {
            setOpen(!open);
            Animated.timing(animation, {
                toValue: open ? 0 : 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else if (onPress) {
            onPress();
        }
    };

    const { size: buttonSize, iconSize } = getButtonSize();
    const fabColor = color || colors.primary;

    return (
        <View style={[styles.container, getPositionStyle(), style]}>
            {/* Action buttons (only shown when open) */}
            {actions && actions.length > 0 && open && (
                <Animated.View
                    style={[
                        styles.actionsContainer,
                        {
                            opacity: animation,
                            transform: [
                                {
                                    translateY: animation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [20, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {actions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.actionButton,
                                {
                                    backgroundColor: action.color || colors.background.secondary,
                                    marginBottom: 12,
                                },
                            ]}
                            onPress={() => {
                                setOpen(false);
                                animation.setValue(0);
                                action.onPress();
                            }}
                        >
                            {action.label && (
                                <View style={[styles.actionLabel, { backgroundColor: isDark ? colors.background.tertiary : colors.background.secondary }]}>
                                    <Text style={{ color: colors.text.primary, fontSize: 14 }}>
                                        {action.label}
                                    </Text>
                                </View>
                            )}
                            <View style={[styles.actionIcon, { width: buttonSize * 0.8, height: buttonSize * 0.8 }]}>
                                <Ionicons
                                    name={action.icon}
                                    size={iconSize * 0.8}
                                    color={action.color || colors.text.primary}
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            )}

            {/* Main FAB */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: fabColor,
                        width: extended && label ? 'auto' : buttonSize,
                        height: buttonSize,
                        borderRadius: extended && label ? buttonSize / 2 : buttonSize / 2,
                    },
                    open && { backgroundColor: colors.error },
                    disabled && { opacity: 0.6 },
                ]}
                onPress={handlePress}
                disabled={disabled}
                activeOpacity={0.8}
            >
                <Ionicons
                    name={open ? 'close' : icon}
                    size={iconSize}
                    color="white"
                />
                {extended && label && (
                    <Text style={styles.fabLabel}>{label}</Text>
                )}
            </TouchableOpacity>

            {/* Backdrop for closing actions */}
            {open && (
                <TouchableOpacity
                    style={styles.backdrop}
                    onPress={() => {
                        setOpen(false);
                        Animated.timing(animation, {
                            toValue: 0,
                            duration: 300,
                            useNativeDriver: true,
                        }).start();
                    }}
                    activeOpacity={1}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignItems: 'flex-end',
        zIndex: 10,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        paddingHorizontal: 16,
    },
    fabLabel: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        marginLeft: 8,
        marginRight: 8,
    },
    actionsContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    actionIcon: {
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    actionLabel: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        marginRight: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    backdrop: {
        position: 'absolute',
        top: -1000,
        bottom: -16,
        left: -1000,
        right: -16,
        backgroundColor: 'transparent',
    },
});

export default FloatingActionButton;