// src/components/ui/StatusIndicator.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

interface StatusIndicatorProps {
    type: StatusType;
    size?: 'small' | 'medium' | 'large';
    label?: string;
    showIcon?: boolean;
    style?: StyleProp<ViewStyle>;
    iconOverride?: keyof typeof Ionicons.glyphMap;
    inline?: boolean;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
    type,
    size = 'medium',
    label,
    showIcon = true,
    style,
    iconOverride,
    inline = false,
}) => {
    const { colors } = useTheme();

    // Get color based on status type
    const getStatusColor = (): string => {
        switch (type) {
            case 'success':
                return colors.success;
            case 'warning':
                return colors.warning;
            case 'error':
                return colors.error;
            case 'info':
                return colors.primary;
            case 'neutral':
                return colors.text.secondary;
            case 'pending':
                return colors.warning;
            default:
                return colors.text.secondary;
        }
    };

    // Get icon based on status type
    const getStatusIcon = (): keyof typeof Ionicons.glyphMap => {
        if (iconOverride) return iconOverride;

        switch (type) {
            case 'success':
                return 'checkmark-circle';
            case 'warning':
                return 'alert-circle';
            case 'error':
                return 'close-circle';
            case 'info':
                return 'information-circle';
            case 'neutral':
                return 'ellipse';
            case 'pending':
                return 'time';
            default:
                return 'ellipse';
        }
    };

    // Get size of indicator and icon
    const getSize = (): { dotSize: number; iconSize: number; fontSize: number } => {
        switch (size) {
            case 'small':
                return { dotSize: 8, iconSize: 16, fontSize: 12 };
            case 'medium':
                return { dotSize: 10, iconSize: 20, fontSize: 14 };
            case 'large':
                return { dotSize: 12, iconSize: 24, fontSize: 16 };
            default:
                return { dotSize: 10, iconSize: 20, fontSize: 14 };
        }
    };

    const statusColor = getStatusColor();
    const statusIcon = getStatusIcon();
    const { dotSize, iconSize, fontSize } = getSize();

    return (
        <View style={[
            styles.container,
            inline && styles.inlineContainer,
            style
        ]}>
            {showIcon ? (
                <Ionicons name={statusIcon} size={iconSize} color={statusColor} />
            ) : (
                <View
                    style={[
                        styles.dot,
                        { width: dotSize, height: dotSize, borderRadius: dotSize / 2, backgroundColor: statusColor }
                    ]}
                />
            )}

            {label && (
                <Text
                    variant={size === 'small' ? 'caption' : 'body'}
                    style={[styles.label, { color: statusColor, fontSize }]}
                >
                    {label}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    inlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        marginRight: 6,
    },
    label: {
        marginLeft: 6,
        fontWeight: '500',
    },
});

export default StatusIndicator;