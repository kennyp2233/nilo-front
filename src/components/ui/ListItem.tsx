// src/components/ui/ListItem.tsx
import React from 'react';
import {
    View,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';
import Avatar from './Avatar';

interface ListItemProps {
    title: string;
    subtitle?: string;
    leading?: React.ReactNode;
    trailing?: React.ReactNode;
    leadingIcon?: keyof typeof Ionicons.glyphMap;
    trailingIcon?: keyof typeof Ionicons.glyphMap;
    avatarSource?: any;
    avatarText?: string;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    dense?: boolean;
    divider?: boolean;
    disabled?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({
    title,
    subtitle,
    leading,
    trailing,
    leadingIcon,
    trailingIcon,
    avatarSource,
    avatarText,
    onPress,
    style,
    dense = false,
    divider = true,
    disabled = false,
}) => {
    const { colors } = useTheme();

    // Componente principal
    const Component = onPress ? TouchableOpacity : View;
    const componentProps = onPress
        ? { onPress, disabled, activeOpacity: 0.7 }
        : {};

    // Obtener estilos para densidad
    const getDensityStyles = (): ViewStyle => {
        return dense
            ? { paddingVertical: 8 }
            : { paddingVertical: 12 };
    };

    return (
        <Component
            style={[
                styles.container,
                getDensityStyles(),
                divider && { borderBottomWidth: 1, borderBottomColor: colors.border },
                disabled && { opacity: 0.5 },
                style,
            ]}
            {...componentProps}
        >
            {/* Área izquierda: puede ser un componente personalizado, un icono o un avatar */}
            {leading ? (
                <View style={styles.leading}>{leading}</View>
            ) : leadingIcon ? (
                <View style={styles.leadingIcon}>
                    <Ionicons name={leadingIcon} size={24} color={colors.text.secondary} />
                </View>
            ) : avatarSource || avatarText ? (
                <View style={styles.leading}>
                    <Avatar
                        source={avatarSource}
                        name={avatarText}
                        size="small"
                    />
                </View>
            ) : null}

            {/* Área de contenido principal */}
            <View style={styles.content}>
                <Text
                    variant={dense ? 'body' : 'subtitle'}
                    color="primary"
                    numberOfLines={1}
                >
                    {title}
                </Text>

                {subtitle && (
                    <Text
                        variant="caption"
                        color="secondary"
                        numberOfLines={dense ? 1 : 2}
                        style={styles.subtitle}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Área derecha: puede ser un componente personalizado o un icono */}
            {trailing ? (
                <View style={styles.trailing}>{trailing}</View>
            ) : trailingIcon ? (
                <View style={styles.trailingIcon}>
                    <Ionicons name={trailingIcon} size={20} color={colors.text.secondary} />
                </View>
            ) : null}
        </Component>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    leading: {
        marginRight: 16,
    },
    leadingIcon: {
        marginRight: 16,
        width: 24,
        alignItems: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    subtitle: {
        marginTop: 2,
    },
    trailing: {
        marginLeft: 16,
    },
    trailingIcon: {
        marginLeft: 16,
        width: 20,
        alignItems: 'center',
    },
});

export default ListItem;