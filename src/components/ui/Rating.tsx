// src/components/ui/Rating.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';

interface RatingProps {
    value: number;
    maxValue?: number;
    size?: 'small' | 'medium' | 'large';
    precision?: 0.5 | 1;
    onChange?: (newValue: number) => void;
    showValue?: boolean;
    valueDecimals?: number;
    style?: StyleProp<ViewStyle>;
    readonly?: boolean;
}

const Rating: React.FC<RatingProps> = ({
    value,
    maxValue = 5,
    size = 'medium',
    precision = 1,
    onChange,
    showValue = false,
    valueDecimals = 1,
    style,
    readonly = false,
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

    // Generate stars array
    const renderStars = () => {
        const stars = [];
        const iconSize = getIconSize();

        for (let i = 1; i <= maxValue; i++) {
            // Determine the star type (filled, half, or empty)
            let iconName: keyof typeof Ionicons.glyphMap;
            if (i <= value) {
                iconName = 'star';
            } else if (i - 0.5 <= value && precision === 0.5) {
                iconName = 'star-half';
            } else {
                iconName = 'star-outline';
            }

            stars.push(
                <TouchableOpacity
                    key={i}
                    style={styles.star}
                    onPress={() => onChange && onChange(i)}
                    disabled={readonly || !onChange}
                    activeOpacity={readonly ? 1 : 0.7}
                >
                    <Ionicons
                        name={iconName}
                        size={iconSize}
                        color={colors.warning}
                    />
                </TouchableOpacity>
            );
        }

        return stars;
    };

    return (
        <View style={[styles.container, style]}>
            <View style={styles.starsContainer}>
                {renderStars()}
            </View>

            {showValue && (
                <Text
                    variant={size === 'small' ? 'caption' : 'body'}
                    weight="medium"
                    style={styles.ratingValue}
                >
                    {value.toFixed(valueDecimals)}
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
    },
    star: {
        marginRight: 2,
    },
    ratingValue: {
        marginLeft: 8,
    },
});

export default Rating;