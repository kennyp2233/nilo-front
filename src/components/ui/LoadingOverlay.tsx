// src/components/ui/LoadingOverlay.tsx
import React from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    Modal,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

interface LoadingOverlayProps {
    visible: boolean;
    text?: string;
    transparent?: boolean;
    style?: StyleProp<ViewStyle>;
    size?: 'small' | 'large';
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    text,
    transparent = true,
    style,
    size = 'large',
}) => {
    const { colors, isDark } = useTheme();

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View
                style={[
                    styles.container,
                    transparent && {
                        backgroundColor: isDark
                            ? 'rgba(0, 0, 0, 0.7)'
                            : 'rgba(255, 255, 255, 0.7)',
                    },
                    style,
                ]}
            >
                <View
                    style={[
                        styles.loaderContainer,
                        {
                            backgroundColor: colors.background.primary,
                            borderColor: colors.border,
                        },
                    ]}
                >
                    <ActivityIndicator
                        size={size}
                        color={colors.primary}
                        style={styles.loader}
                    />

                    {text && (
                        <Text
                            style={styles.text}
                            color="secondary"
                            weight="medium"
                        >
                            {text}
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        padding: 24,
        borderRadius: 12,
        minWidth: 120,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    loader: {
        marginBottom: 8,
    },
    text: {
        marginTop: 8,
        textAlign: 'center',
    },
});

export default LoadingOverlay;