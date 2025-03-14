// app/auth/register.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from "react-native";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import { useAuth } from "@/src/hooks/useAuth";

export default function RegisterScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { register, isLoading, error, clearError } = useAuth();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        firstName?: string;
        lastName?: string;
        email?: string;
        phone?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone: string) => {
        // Simple phone validation - adjust based on your requirements
        const phoneRegex = /^\+?[0-9]{8,15}$/;
        return phoneRegex.test(phone);
    };

    const handleSubmit = async () => {
        // Clear previous errors
        clearError();

        // Validate form
        const errors: any = {};

        if (!formData.firstName.trim()) {
            errors.firstName = "El nombre es obligatorio";
        }

        if (!formData.lastName.trim()) {
            errors.lastName = "El apellido es obligatorio";
        }

        if (!formData.email) {
            errors.email = "El correo electrónico es obligatorio";
        } else if (!validateEmail(formData.email)) {
            errors.email = "Formato de correo electrónico inválido";
        }

        if (!formData.phone) {
            errors.phone = "El teléfono es obligatorio";
        } else if (!validatePhone(formData.phone)) {
            errors.phone = "Formato de teléfono inválido";
        }

        if (!formData.password) {
            errors.password = "La contraseña es obligatoria";
        } else if (formData.password.length < 6) {
            errors.password = "La contraseña debe tener al menos 6 caracteres";
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Las contraseñas no coinciden";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Clear validation errors
        setValidationErrors({});

        // Submit registration
        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            password: formData.password,
            role: "PASSENGER"
        };

        const success = await register(userData);
        if (success) {
            router.replace("/passenger");
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: colors.background.primary }]}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.headerContainer}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        Crear cuenta
                    </Text>
                </View>

                <View style={styles.formContainer}>
                    {error && (
                        <View style={[styles.errorContainer, { backgroundColor: colors.error + "20" }]}>
                            <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                            <Text style={[styles.errorText, { color: colors.error }]}>
                                {error}
                            </Text>
                        </View>
                    )}

                    <View style={styles.nameContainer}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                            <Text style={[styles.label, { color: colors.text.secondary }]}>
                                Nombre
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.background.secondary,
                                    borderColor: validationErrors.firstName ? colors.error : colors.border
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder="Nombre"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.firstName}
                                    onChangeText={(value) => handleChange("firstName", value)}
                                />
                            </View>
                            {validationErrors.firstName && (
                                <Text style={[styles.validationError, { color: colors.error }]}>
                                    {validationErrors.firstName}
                                </Text>
                            )}
                        </View>

                        <View style={[styles.inputGroup, { flex: 1 }]}>
                            <Text style={[styles.label, { color: colors.text.secondary }]}>
                                Apellido
                            </Text>
                            <View style={[
                                styles.inputContainer,
                                {
                                    backgroundColor: colors.background.secondary,
                                    borderColor: validationErrors.lastName ? colors.error : colors.border
                                }
                            ]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder="Apellido"
                                    placeholderTextColor={colors.text.tertiary}
                                    value={formData.lastName}
                                    onChangeText={(value) => handleChange("lastName", value)}
                                />
                            </View>
                            {validationErrors.lastName && (
                                <Text style={[styles.validationError, { color: colors.error }]}>
                                    {validationErrors.lastName}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text.secondary }]}>
                            Correo electrónico
                        </Text>
                        <View style={[
                            styles.inputContainer,
                            {
                                backgroundColor: colors.background.secondary,
                                borderColor: validationErrors.email ? colors.error : colors.border
                            }
                        ]}>
                            <Ionicons name="mail-outline" size={20} color={colors.text.secondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder="tucorreo@ejemplo.com"
                                placeholderTextColor={colors.text.tertiary}
                                value={formData.email}
                                onChangeText={(value) => handleChange("email", value)}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>
                        {validationErrors.email && (
                            <Text style={[styles.validationError, { color: colors.error }]}>
                                {validationErrors.email}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text.secondary }]}>
                            Teléfono
                        </Text>
                        <View style={[
                            styles.inputContainer,
                            {
                                backgroundColor: colors.background.secondary,
                                borderColor: validationErrors.phone ? colors.error : colors.border
                            }
                        ]}>
                            <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder="+593XXXXXXXXX"
                                placeholderTextColor={colors.text.tertiary}
                                value={formData.phone}
                                onChangeText={(value) => handleChange("phone", value)}
                                keyboardType="phone-pad"
                            />
                        </View>
                        {validationErrors.phone && (
                            <Text style={[styles.validationError, { color: colors.error }]}>
                                {validationErrors.phone}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text.secondary }]}>
                            Contraseña
                        </Text>
                        <View style={[
                            styles.inputContainer,
                            {
                                backgroundColor: colors.background.secondary,
                                borderColor: validationErrors.password ? colors.error : colors.border
                            }
                        ]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder="Contraseña"
                                placeholderTextColor={colors.text.tertiary}
                                value={formData.password}
                                onChangeText={(value) => handleChange("password", value)}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                                    size={20}
                                    color={colors.text.secondary}
                                />
                            </TouchableOpacity>
                        </View>
                        {validationErrors.password && (
                            <Text style={[styles.validationError, { color: colors.error }]}>
                                {validationErrors.password}
                            </Text>
                        )}
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.text.secondary }]}>
                            Confirmar contraseña
                        </Text>
                        <View style={[
                            styles.inputContainer,
                            {
                                backgroundColor: colors.background.secondary,
                                borderColor: validationErrors.confirmPassword ? colors.error : colors.border
                            }
                        ]}>
                            <Ionicons name="lock-closed-outline" size={20} color={colors.text.secondary} />
                            <TextInput
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder="Confirmar contraseña"
                                placeholderTextColor={colors.text.tertiary}
                                value={formData.confirmPassword}
                                onChangeText={(value) => handleChange("confirmPassword", value)}
                                secureTextEntry={!showPassword}
                            />
                        </View>
                        {validationErrors.confirmPassword && (
                            <Text style={[styles.validationError, { color: colors.error }]}>
                                {validationErrors.confirmPassword}
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.registerButton, { backgroundColor: colors.primary }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.registerButtonText}>Crear cuenta</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={[styles.loginText, { color: colors.text.secondary }]}>
                            ¿Ya tienes una cuenta?
                        </Text>
                        <Link href="/auth/login" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.loginLink, { color: colors.primary }]}>
                                    Inicia sesión
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>

                    <Text style={[styles.termsText, { color: colors.text.tertiary }]}>
                        Al registrarte, aceptas nuestros{" "}
                        <Text style={[styles.termsLink, { color: colors.primary }]}>
                            Términos de servicio
                        </Text>{" "}
                        y{" "}
                        <Text style={[styles.termsLink, { color: colors.primary }]}>
                            Política de privacidad
                        </Text>
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
    },
    headerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        marginLeft: 16,
    },
    formContainer: {
        width: "100%",
    },
    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        marginLeft: 8,
        fontSize: 14,
    },
    nameContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
    },
    validationError: {
        fontSize: 12,
        marginTop: 4,
    },
    registerButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
    },
    registerButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    loginContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 8,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
    termsText: {
        textAlign: "center",
        fontSize: 12,
        marginTop: 24,
        lineHeight: 18,
    },
    termsLink: {
        fontWeight: "600",
    },
});