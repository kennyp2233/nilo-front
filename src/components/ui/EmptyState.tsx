// src/components/ui/EmptyState.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';
import Button from './Button';

interface EmptyStateProps {
    icon?: keyof typeof Ionicons.glyphMap;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    style?: StyleProp<ViewStyle>;
    iconSize?: number;
    iconColor?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon = 'alert-circle-outline',
    title,
    description,
    actionLabel,
    onAction,
    style,
    iconSize = 64,
    iconColor,
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <Ionicons
                name={icon}
                size={iconSize}
                color={iconColor || colors.text.tertiary}
                style={styles.icon}
            />

            <Text
                variant="title"
                weight="semibold"
                align="center"
                style={styles.title}
            >
                {title}
            </Text>

            {description && (
                <Text
                    variant="body"
                    color="secondary"
                    align="center"
                    style={styles.description}
                >
                    {description}
                </Text>
            )}

            {actionLabel && onAction && (
                <Button
                    title={actionLabel}
                    onPress={onAction}
                    variant="primary"
                    style={styles.actionButton}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 240,
    },
    icon: {
        marginBottom: 16,
    },
    title: {
        marginBottom: 8,
    },
    description: {
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    actionButton: {
        minWidth: 200,
    },
});

export default EmptyState;