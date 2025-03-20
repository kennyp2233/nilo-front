// src/components/ui/Header.tsx
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ViewStyle,
    StyleProp,
    Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';
import { useRouter } from 'expo-router';
import Text from './Text';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onLeftPress?: () => void;
    onRightPress?: () => void;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    backgroundColor?: string;
    style?: StyleProp<ViewStyle>;
    fixed?: boolean;
    transparent?: boolean;
    leftIconColor?: string;
    rightIconColor?: string;
    statusBarStyle?: 'light-content' | 'dark-content';
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    showBackButton = false,
    rightComponent,
    backgroundColor,
    style,
    fixed = false,
    transparent = false,
    leftIconColor,
    rightIconColor,
    statusBarStyle,
}) => {
    const { colors, isDark } = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Handle back button press
    const handleBackPress = () => {
        if (onLeftPress) {
            onLeftPress();
        } else {
            router.back();
        }
    };

    // Calculate the status bar height
    const statusBarHeight = insets.top;

    // Determine background color
    const headerBgColor = transparent
        ? 'transparent'
        : backgroundColor || colors.background.primary;

    // Determine text and icon colors based on mode
    const defaultIconColor = transparent
        ? (statusBarStyle === 'light-content' ? '#FFFFFF' : '#000000')
        : colors.text.primary;

    // Set the actual icon colors
    const actualLeftIconColor = leftIconColor || defaultIconColor;
    const actualRightIconColor = rightIconColor || defaultIconColor;

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: headerBgColor,
                    paddingTop: fixed ? statusBarHeight : 0,
                    position: fixed ? 'absolute' : 'relative',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: fixed ? 1000 : 1,
                },
                style,
            ]}
        >
            {fixed && (
                <StatusBar
                    barStyle={statusBarStyle || (isDark ? 'light-content' : 'dark-content')}
                    backgroundColor="transparent"
                    translucent
                />
            )}

            <View style={styles.headerContent}>
                {/* Left icon or back button */}
                {(showBackButton || leftIcon) ? (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={showBackButton ? handleBackPress : onLeftPress}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={showBackButton ? 'arrow-back' : leftIcon as any}
                            size={24}
                            color={actualLeftIconColor}
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={styles.iconPlaceholder} />
                )}

                {/* Title and subtitle */}
                <View style={styles.titleContainer}>
                    {title && (
                        <Text
                            variant="title"
                            weight="semibold"
                            style={[
                                styles.title,
                                {
                                    color: transparent
                                        ? (statusBarStyle === 'light-content' ? '#FFFFFF' : '#000000')
                                        : colors.text.primary
                                }
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                    )}

                    {subtitle && (
                        <Text
                            variant="caption"
                            style={[
                                styles.subtitle,
                                {
                                    color: transparent
                                        ? (statusBarStyle === 'light-content' ? '#FFFFFF' : '#000000')
                                        : colors.text.secondary
                                }
                            ]}
                            numberOfLines={1}
                        >
                            {subtitle}
                        </Text>
                    )}
                </View>

                {/* Right icon or custom component */}
                {rightIcon ? (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={onRightPress}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={rightIcon}
                            size={24}
                            color={actualRightIconColor}
                        />
                    </TouchableOpacity>
                ) : rightComponent ? (
                    <View style={styles.rightComponent}>
                        {rightComponent}
                    </View>
                ) : (
                    <View style={styles.iconPlaceholder} />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        paddingHorizontal: 16,
        width: '100%',
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
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
        height: 40,
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
});

export default Header;