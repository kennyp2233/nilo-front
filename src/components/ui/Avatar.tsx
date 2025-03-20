// src/components/ui/Avatar.tsx
import React from 'react';
import {
    View,
    Image,
    StyleSheet,
    ViewStyle,
    StyleProp,
    ImageSourcePropType,
    ImageStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

interface AvatarProps {
    source?: ImageSourcePropType;
    name?: string;
    size?: 'tiny' | 'small' | 'medium' | 'large' | 'xlarge';
    variant?: 'circle' | 'rounded' | 'square';
    fallbackIcon?: keyof typeof Ionicons.glyphMap;
    status?: 'online' | 'offline' | 'away' | 'busy';
    badge?: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    imageStyle?: StyleProp<ImageStyle>;
}

const Avatar: React.FC<AvatarProps> = ({
    source,
    name,
    size = 'medium',
    variant = 'circle',
    fallbackIcon = 'person',
    status,
    badge,
    style,
    imageStyle,
}) => {
    const { colors } = useTheme();

    // Obtener iniciales del nombre
    const getInitials = (): string => {
        if (!name) return '';

        const nameParts = name.trim().split(' ');

        if (nameParts.length === 1) {
            return nameParts[0].charAt(0).toUpperCase();
        }

        return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };

    // Determinar tamaño
    const getSize = (): number => {
        switch (size) {
            case 'tiny':
                return 24;
            case 'small':
                return 32;
            case 'medium':
                return 48;
            case 'large':
                return 64;
            case 'xlarge':
                return 96;
            default:
                return 48;
        }
    };

    // Determinar tamaño de fuente para iniciales
    const getFontSize = (): number => {
        switch (size) {
            case 'tiny':
                return 10;
            case 'small':
                return 12;
            case 'medium':
                return 18;
            case 'large':
                return 24;
            case 'xlarge':
                return 36;
            default:
                return 18;
        }
    };

    // Determinar tamaño de icono
    const getIconSize = (): number => {
        switch (size) {
            case 'tiny':
                return 12;
            case 'small':
                return 16;
            case 'medium':
                return 24;
            case 'large':
                return 32;
            case 'xlarge':
                return 48;
            default:
                return 24;
        }
    };

    // Determinar borde del avatar según variante
    const getBorderRadius = (): number => {
        const avatarSize = getSize();

        switch (variant) {
            case 'circle':
                return avatarSize / 2;
            case 'rounded':
                return avatarSize / 4;
            case 'square':
                return 0;
            default:
                return avatarSize / 2;
        }
    };

    // Obtener color de status
    const getStatusColor = (): string => {
        switch (status) {
            case 'online':
                return colors.success;
            case 'offline':
                return colors.text.tertiary;
            case 'away':
                return colors.warning;
            case 'busy':
                return colors.error;
            default:
                return 'transparent';
        }
    };

    // Obtener estilos para el avatar
    const avatarSize = getSize();
    const borderRadius = getBorderRadius();
    const fontSize = getFontSize();

    return (
        <View style={[{ position: 'relative' }, style]}>
            <View
                style={[
                    styles.avatar,
                    {
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: borderRadius,
                        backgroundColor: source ? 'transparent' : colors.background.secondary,
                    },
                ]}
            >
                {source ? (
                    <Image
                        source={source}
                        style={[
                            {
                                width: avatarSize,
                                height: avatarSize,
                                borderRadius: borderRadius,
                            },
                            imageStyle,
                        ]}
                        defaultSource={require('@/assets/images/icon.png')}
                    />
                ) : name ? (
                    <View style={styles.initialsContainer}>
                        <Text style={{ fontSize, color: colors.text.primary, fontWeight: '500' }}>
                            {getInitials()}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.fallbackIconContainer}>
                        <Ionicons
                            name={fallbackIcon}
                            size={getIconSize()}
                            color={colors.text.secondary}
                        />
                    </View>
                )}
            </View>

            {status && (
                <View
                    style={[
                        styles.statusIndicator,
                        {
                            backgroundColor: getStatusColor(),
                            width: avatarSize / 4,
                            height: avatarSize / 4,
                            borderRadius: avatarSize / 8,
                            right: 0,
                            bottom: 0,
                        },
                    ]}
                />
            )}

            {badge && (
                <View style={styles.badgeContainer}>
                    {badge}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    initialsContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fallbackIconContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusIndicator: {
        position: 'absolute',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeContainer: {
        position: 'absolute',
        top: -4,
        right: -4,
    },
});

export default Avatar;