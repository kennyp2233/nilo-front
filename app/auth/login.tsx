// app/auth/login.tsx
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

export default function LoginScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { login, isLoading, error, clearError } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{
        email?: string;
        password?: string;
    }>({});

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        // Clear previous errors
        clearError();

        // Validate form
        const errors: {
            email?: string;
            password?: string;
        } = {};

        if (!email) {
            errors.email = "El correo electrónico es obligatorio";
        } else if (!validateEmail(email)) {
            errors.email = "Formato de correo electrónico inválido";
        }

        if (!password) {
            errors.password = "La contraseña es obligatoria";
        } else if (password.length < 6) {
            errors.password = "La contraseña debe tener al menos 6 caracteres";
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        // Clear validation errors
        setValidationErrors({});

        // Submit login
        const success = await login(email, password);
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
                <View style={styles.logoContainer}>
                    <Image
                        source={require("@/assets/images/icon.png")}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        Inicia sesión en NILO
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
                                value={email}
                                onChangeText={setEmail}
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
                                value={password}
                                onChangeText={setPassword}
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

                    <Link href="/auth/forgot-password" asChild>
                        <TouchableOpacity style={styles.forgotPasswordContainer}>
                            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
                                ¿Olvidaste tu contraseña?
                            </Text>
                        </TouchableOpacity>
                    </Link>

                    <TouchableOpacity
                        style={[styles.loginButton, { backgroundColor: colors.primary }]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.registerContainer}>
                        <Text style={[styles.registerText, { color: colors.text.secondary }]}>
                            ¿No tienes una cuenta?
                        </Text>
                        <Link href="/auth/register" asChild>
                            <TouchableOpacity>
                                <Text style={[styles.registerLink, { color: colors.primary }]}>
                                    Regístrate aquí
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
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
        justifyContent: "center",
        padding: 20,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
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
    forgotPasswordContainer: {
        alignItems: "flex-end",
        marginBottom: 20,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    loginButton: {
        height: 50,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 16,
    },
    registerText: {
        fontSize: 14,
    },
    registerLink: {
        fontSize: 14,
        fontWeight: "600",
        marginLeft: 4,
    },
});