// src/components/ui/Toast.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Dimensions,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    visible: boolean;
    message: string;
    duration?: number;
    onDismiss?: () => void;
    type?: ToastType;
    position?: 'top' | 'bottom';
    showIcon?: boolean;
    action?: {
        text: string;
        onPress: () => void;
    };
    style?: StyleProp<ViewStyle>;
}

const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    duration = 3000,
    onDismiss,
    type = 'info',
    position = 'bottom',
    showIcon = true,
    action,
    style,
}) => {
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();
    const [isVisible, setIsVisible] = useState(visible);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (visible) {
            setIsVisible(true);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            if (duration > 0) {
                timerRef.current = setTimeout(() => {
                    hideToast();
                }, duration);
            }
        } else {
            hideToast();
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [visible, duration]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: position === 'top' ? -100 : 100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setIsVisible(false);
            if (onDismiss) {
                onDismiss();
            }
        });
    };

    // Get background color and icon based on type
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    backgroundColor: colors.success + '20',
                    borderColor: colors.success,
                    icon: 'checkmark-circle',
                    color: colors.success,
                };
            case 'error':
                return {
                    backgroundColor: colors.error + '20',
                    borderColor: colors.error,
                    icon: 'alert-circle',
                    color: colors.error,
                };
            case 'warning':
                return {
                    backgroundColor: colors.warning + '20',
                    borderColor: colors.warning,
                    icon: 'warning',
                    color: colors.warning,
                };
            case 'info':
            default:
                return {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                    icon: 'information-circle',
                    color: colors.primary,
                };
        }
    };

    const typeStyles = getTypeStyles();

    if (!isVisible) {
        return null;
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    [position]: position === 'top' ? insets.top + 16 : insets.bottom + 16,
                },
                style,
            ]}
        >
            <View
                style={[
                    styles.toast,
                    {
                        backgroundColor: typeStyles.backgroundColor,
                        borderColor: typeStyles.borderColor,
                    },
                ]}
            >
                {showIcon && (
                    <Ionicons
                        name={typeStyles.icon as any}
                        size={24}
                        color={typeStyles.color}
                        style={styles.icon}
                    />
                )}

                <Text
                    style={[
                        styles.message,
                        { color: colors.text.primary },
                        action ? { marginRight: 8 } : { marginRight: 16 },
                    ]}
                    numberOfLines={2}
                >
                    {message}
                </Text>

                {action && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            action.onPress();
                            hideToast();
                        }}
                    >
                        <Text
                            style={[
                                styles.actionText,
                                { color: typeStyles.color },
                            ]}
                        >
                            {action.text}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={hideToast}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons
                        name="close"
                        size={16}
                        color={colors.text.secondary}
                    />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

// Toast Manager component
interface ToastManagerState {
    visible: boolean;
    message: string;
    type: ToastType;
    duration: number;
    position: 'top' | 'bottom';
    action?: {
        text: string;
        onPress: () => void;
    };
}

class ToastManager {
    private static instance: ToastManager;
    private callback: ((state: ToastManagerState) => void) | null = null;

    private state: ToastManagerState = {
        visible: false,
        message: '',
        type: 'info',
        duration: 3000,
        position: 'bottom',
    };

    static getInstance(): ToastManager {
        if (!ToastManager.instance) {
            ToastManager.instance = new ToastManager();
        }
        return ToastManager.instance;
    }

    register(callback: (state: ToastManagerState) => void) {
        this.callback = callback;
    }

    unregister() {
        this.callback = null;
    }

    show(message: string, options?: Partial<Omit<ToastManagerState, 'visible' | 'message'>>) {
        this.state = {
            ...this.state,
            visible: true,
            message,
            ...options,
        };
        if (this.callback) {
            this.callback(this.state);
        }
    }

    hide() {
        this.state = {
            ...this.state,
            visible: false,
        };
        if (this.callback) {
            this.callback(this.state);
        }
    }

    success(message: string, options?: Partial<Omit<ToastManagerState, 'visible' | 'message' | 'type'>>) {
        this.show(message, { type: 'success', ...options });
    }

    error(message: string, options?: Partial<Omit<ToastManagerState, 'visible' | 'message' | 'type'>>) {
        this.show(message, { type: 'error', ...options });
    }

    warning(message: string, options?: Partial<Omit<ToastManagerState, 'visible' | 'message' | 'type'>>) {
        this.show(message, { type: 'warning', ...options });
    }

    info(message: string, options?: Partial<Omit<ToastManagerState, 'visible' | 'message' | 'type'>>) {
        this.show(message, { type: 'info', ...options });
    }
}

// Toast Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ToastManagerState>({
        visible: false,
        message: '',
        type: 'info',
        duration: 3000,
        position: 'bottom',
    });

    useEffect(() => {
        const toastManager = ToastManager.getInstance();
        toastManager.register(setState);

        return () => {
            toastManager.unregister();
        };
    }, []);

    return (
        <>
            {children}
            <Toast
                visible={state.visible}
                message={state.message}
                type={state.type}
                duration={state.duration}
                position={state.position}
                action={state.action}
                onDismiss={() => {
                    setState((prev) => ({ ...prev, visible: false }));
                }}
            />
        </>
    );
};

// Toast hook
export const useToast = () => {
    return ToastManager.getInstance();
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 9999,
        alignItems: 'center',
    },
    toast: {
        width: SCREEN_WIDTH - 32,
        maxWidth: 500,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    icon: {
        marginRight: 12,
    },
    message: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    closeButton: {
        marginLeft: 8,
        padding: 4,
    },
    actionButton: {
        marginLeft: 8,
        padding: 4,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default Toast;