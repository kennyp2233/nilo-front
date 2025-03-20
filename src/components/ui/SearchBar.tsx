// src/components/ui/SearchBar.tsx
import React, { useState, useRef } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ViewStyle,
    TextStyle,
    StyleProp,
    Animated,
    Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/ThemeContext';

interface SearchBarProps {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onSubmit?: () => void;
    onClear?: () => void;
    autoFocus?: boolean;
    showCancelButton?: boolean;
    onCancel?: () => void;
    style?: StyleProp<ViewStyle>;
    inputStyle?: StyleProp<TextStyle>;
    variant?: 'outlined' | 'filled';
    disabled?: boolean;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onFocus?: () => void;
    onBlur?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
    placeholder = 'Search',
    value,
    onChangeText,
    onSubmit,
    onClear,
    autoFocus = false,
    showCancelButton = false,
    onCancel,
    style,
    inputStyle,
    variant = 'filled',
    disabled = false,
    leftIcon = 'search',
    rightIcon,
    onFocus,
    onBlur,
}) => {
    const { colors, isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const cancelButtonWidth = useRef(new Animated.Value(0)).current;
    const inputRef = useRef<TextInput>(null);

    // Handle input focus
    const handleFocus = () => {
        setIsFocused(true);
        if (showCancelButton) {
            Animated.timing(cancelButtonWidth, {
                toValue: 60, // Width of cancel button
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
        if (onFocus) onFocus();
    };

    // Handle input blur
    const handleBlur = () => {
        setIsFocused(false);
        if (showCancelButton && !value) {
            Animated.timing(cancelButtonWidth, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }).start();
        }
        if (onBlur) onBlur();
    };

    // Handle text clear
    const handleClear = () => {
        onChangeText('');
        if (onClear) onClear();
    };

    // Handle cancel button press
    const handleCancel = () => {
        Keyboard.dismiss();
        onChangeText('');
        setIsFocused(false);
        Animated.timing(cancelButtonWidth, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
        }).start();
        if (onCancel) onCancel();
    };

    // Get background color based on variant
    const getBackgroundColor = () => {
        if (variant === 'outlined') {
            return 'transparent';
        }
        return isDark ? colors.background.secondary : colors.background.secondary;
    };

    // Get border style based on variant
    const getBorderStyle = () => {
        if (variant === 'outlined') {
            return {
                borderWidth: 1,
                borderColor: isFocused ? colors.primary : colors.border,
            };
        }
        return {};
    };

    return (
        <View style={[styles.container, style]}>
            <View
                style={[
                    styles.searchBar,
                    {
                        backgroundColor: getBackgroundColor(),
                        ...getBorderStyle(),
                    },
                    disabled && styles.disabled,
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={colors.text.secondary}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        {
                            color: colors.text.primary,
                            flex: 1,
                        },
                        inputStyle,
                    ]}
                    placeholder={placeholder}
                    placeholderTextColor={colors.text.tertiary}
                    value={value}
                    onChangeText={onChangeText}
                    onSubmitEditing={onSubmit}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    autoFocus={autoFocus}
                    editable={!disabled}
                    returnKeyType="search"
                    autoCapitalize="none"
                    autoCorrect={false}
                />

                {value.length > 0 && (
                    <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
                        <Ionicons
                            name="close-circle"
                            size={18}
                            color={colors.text.tertiary}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && value.length === 0 && (
                    <Ionicons
                        name={rightIcon}
                        size={20}
                        color={colors.text.secondary}
                        style={styles.icon}
                    />
                )}
            </View>

            {showCancelButton && (
                <Animated.View
                    style={{
                        width: cancelButtonWidth,
                        overflow: 'hidden',
                    }}
                >
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Animated.Text
                            style={[
                                styles.cancelText,
                                {
                                    color: colors.primary,
                                },
                            ]}
                        >
                            Cancel
                        </Animated.Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    input: {
        fontSize: 16,
        paddingLeft: 8,
        paddingRight: 8,
        marginRight: 4,
        height: '100%',
    },
    icon: {
        marginRight: 4,
    },
    clearButton: {
        padding: 4,
    },
    disabled: {
        opacity: 0.5,
    },
    cancelButton: {
        paddingLeft: 8,
        paddingRight: 4,
        height: 44,
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 16,
    },
});

export default SearchBar;