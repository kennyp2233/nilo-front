// src/components/ui/Badge.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

interface BadgeProps {
  label?: string | number;
  variant?: 'default' | 'dot' | 'outline';
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  size = 'medium',
  color = 'primary',
  style,
  textStyle,
}) => {
  const { colors } = useTheme();

  // Determinar color de fondo
  const getColor = (): string => {
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
      default:
        return colors.primary;
    }
  };

  // Determinar tamaño
  const getSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return variant === 'dot'
          ? { width: 8, height: 8 }
          : { paddingHorizontal: 6, paddingVertical: 2 };
      case 'medium':
        return variant === 'dot'
          ? { width: 12, height: 12 }
          : { paddingHorizontal: 8, paddingVertical: 3 };
      case 'large':
        return variant === 'dot'
          ? { width: 16, height: 16 }
          : { paddingHorizontal: 12, paddingVertical: 4 };
      default:
        return variant === 'dot'
          ? { width: 12, height: 12 }
          : { paddingHorizontal: 8, paddingVertical: 3 };
    }
  };

  // Determinar estilos de texto según tamaño
  const getTextSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 10 };
      case 'medium':
        return { fontSize: 12 };
      case 'large':
        return { fontSize: 14 };
      default:
        return { fontSize: 12 };
    }
  };

  // Determinar estilos según variante
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: getColor(),
        };
      case 'dot':
      case 'default':
      default:
        return {
          backgroundColor: getColor(),
        };
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getSize(),
        getVariantStyles(),
        variant !== 'dot' && styles.textBadge,
        style,
      ]}
    >
      {variant !== 'dot' && label !== undefined && (
        <Text
          style={[
            styles.badgeText,
            getTextSize(),
            { color: variant === 'outline' ? getColor() : 'white' },
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 100,
    alignSelf: 'flex-start',
  },
  textBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Badge;