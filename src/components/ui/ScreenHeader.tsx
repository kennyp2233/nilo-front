// src/components/ui/ScreenHeader.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
    title,
    subtitle,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    showBackButton = false,
    rightComponent,
    style,
}) => {
    const { colors } = useTheme();
    const router = useRouter();

    // Si showBackButton es true, usar flecha atrás y navegar a la pantalla anterior
    const handleBackPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else {
            router.back();
        }
    };

    return (
        <View style={[styles.header, style]}>
            {/* Botón izquierdo o de retroceso */}
            {(showBackButton || leftIcon) && (
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={showBackButton ? handleBackPress : onLeftPress}
                >
                    <Ionicons
                        name={showBackButton ? 'arrow-back' : leftIcon}
                        size={24}
                        color={colors.text.primary}
                    />
                </TouchableOpacity>
            )}

            {/* Área de título, puede incluir subtítulo */}
            <View style={styles.titleContainer}>
                <Text variant="h3" weight="semibold" style={styles.title}>
                    {title}
                </Text>

                {subtitle && (
                    <Text variant="caption" color="secondary" style={styles.subtitle}>
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Área derecha: puede ser un icono o un componente personalizado */}
            {rightIcon ? (
                <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
                    <Ionicons name={rightIcon} size={24} color={colors.text.primary} />
                </TouchableOpacity>
            ) : rightComponent ? (
                <View style={styles.rightComponent}>{rightComponent}</View>
            ) : (
                // Espaciador para mantener el título centrado
                <View style={styles.iconButton} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 2,
    },
    rightComponent: {
        minWidth: 40,
        alignItems: 'flex-end',
    },
});

export default ScreenHeader;