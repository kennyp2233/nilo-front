// src/components/ui/FormField.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useTheme } from '@/src/theme/ThemeContext';
import Text from './Text';
import Input, { InputProps } from './Input';

interface FormFieldProps extends InputProps {
    label: string;
    error?: string;
    helper?: string;
    required?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
    showAsterisk?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    helper,
    required = false,
    containerStyle,
    showAsterisk = true,
    ...inputProps
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, containerStyle]}>
            <View style={styles.labelContainer}>
                <Text
                    variant="subtitle"
                    color={error ? "error" : "secondary"}
                    style={styles.label}
                >
                    {label}
                </Text>
                {required && showAsterisk && (
                    <Text
                        variant="subtitle"
                        color="error"
                        style={styles.asterisk}
                    >
                        *
                    </Text>
                )}
            </View>

            <Input
                error={error}
                helper={helper}
                {...inputProps}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 16,
    },
    asterisk: {
        marginLeft: 4,
    },
});

export default FormField;