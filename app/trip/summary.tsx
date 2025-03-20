// app/trip/summary.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/theme/ThemeContext";
import { useTrip } from "@/src/hooks/useTrip";

export default function TripSummaryScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { tripId } = useLocalSearchParams<{ tripId: string }>();
    const { fetchTripDetails, activeTrip, rateTrip, isLoading, error } = useTrip(tripId);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch trip details
    useEffect(() => {
        if (tripId) {
            fetchTripDetails(tripId);
        }
    }, [tripId]);

    // Handle rating submission
    const handleSubmitRating = async () => {
        if (!activeTrip || !activeTrip.driver) {
            Alert.alert("Error", "No se puede calificar el viaje sin información del conductor");
            return;
        }

        setIsSubmitting(true);
        try {
            const success = await rateTrip(tripId as string, activeTrip.driver.id, rating, comment);

            if (success) {
                Alert.alert(
                    "¡Gracias por tu calificación!",
                    "Tu opinión nos ayuda a mejorar el servicio.",
                    [
                        {
                            text: "OK",
                            onPress: () => router.replace("/passenger")
                        }
                    ]
                );
            } else {
                Alert.alert("Error", "No se pudo enviar la calificación. Inténtalo de nuevo.");
            }
        } catch (err) {
            console.error("Error al calificar:", err);
            Alert.alert("Error", "Ocurrió un error al enviar la calificación");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Skip rating and go back to home
    const handleSkipRating = () => {
        Alert.alert(
            "¿Omitir calificación?",
            "Tu opinión es importante para mejorar nuestro servicio.",
            [
                {
                    text: "Calificar ahora",
                    style: "cancel"
                },
                {
                    text: "Omitir",
                    onPress: () => router.replace("/passenger")
                }
            ]
        );
    };

    if (!activeTrip && isLoading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text.primary }]}>
                    Cargando detalles del viaje...
                </Text>
            </View>
        );
    }

    if (!activeTrip) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
                <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
                <Text style={[styles.loadingText, { color: colors.text.primary }]}>
                    No se encontró información del viaje
                </Text>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.primary }]}
                    onPress={() => router.replace("/passenger")}
                >
                    <Text style={styles.backButtonText}>Volver al inicio</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Mock data to fill in missing trip information (in a real app, this would come from the API)
    const tripData = {
        distance: activeTrip.distance || 5.2, // km
        duration: activeTrip.duration || 15, // minutes
        price: activeTrip.price || 8.50, // dollars
        startedAt: activeTrip.startedAt || new Date(Date.now() - 20 * 60000).toISOString(),
        completedAt: activeTrip.completedAt || new Date().toISOString(),
        paymentMethod: activeTrip.payment?.method || "CASH",
        driver: activeTrip.driver || {
            id: "driver123",
            name: "Carlos Mendoza",
            rating: 4.8,
            photo: "https://placehold.co/200"
        }
    };

    // Format date and time
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-EC', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get payment method icon
    const getPaymentMethodIcon = (method: string) => {
        switch (method) {
            case "CASH":
                return "cash-outline";
            case "CARD":
                return "card-outline";
            case "WALLET":
                return "wallet-outline";
            default:
                return "cash-outline";
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.container, { backgroundColor: colors.background.primary }]}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        ¡Viaje completado!
                    </Text>
                </View>

                {/* Trip summary card */}
                <View style={[styles.summaryCard, { backgroundColor: colors.background.secondary }]}>
                    {/* Trip info */}
                    <View style={styles.tripInfo}>
                        <View style={styles.tripDetail}>
                            <Ionicons name="speedometer-outline" size={20} color={colors.text.secondary} />
                            <Text style={[styles.tripDetailText, { color: colors.text.primary }]}>
                                {tripData.distance} km
                            </Text>
                        </View>
                        <View style={styles.tripDetail}>
                            <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
                            <Text style={[styles.tripDetailText, { color: colors.text.primary }]}>
                                {tripData.duration} min
                            </Text>
                        </View>
                        <View style={styles.tripDetail}>
                            <Ionicons name={getPaymentMethodIcon(tripData.paymentMethod)} size={20} color={colors.text.secondary} />
                            <Text style={[styles.tripDetailText, { color: colors.text.primary }]}>
                                ${tripData.price.toFixed(2)}
                            </Text>
                        </View>
                    </View>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    {/* Trip locations */}
                    <View style={styles.locations}>
                        <View style={styles.locationItem}>
                            <View style={[styles.locationDot, { backgroundColor: colors.success }]} />
                            <View style={styles.locationText}>
                                <Text style={[styles.locationTime, { color: colors.text.secondary }]}>
                                    {formatTime(tripData.startedAt)}
                                </Text>
                                <Text style={[styles.locationAddress, { color: colors.text.primary }]} numberOfLines={1}>
                                    {activeTrip.startLocation?.name || "Punto de origen"}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.locationLine, { backgroundColor: colors.border }]} />

                        <View style={styles.locationItem}>
                            <View style={[styles.locationDot, { backgroundColor: colors.error }]} />
                            <View style={styles.locationText}>
                                <Text style={[styles.locationTime, { color: colors.text.secondary }]}>
                                    {formatTime(tripData.completedAt)}
                                </Text>
                                <Text style={[styles.locationAddress, { color: colors.text.primary }]} numberOfLines={1}>
                                    {activeTrip.endLocation?.name || "Punto de destino"}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Trip date */}
                    <Text style={[styles.tripDate, { color: colors.text.secondary }]}>
                        {formatDate(tripData.completedAt)}
                    </Text>
                </View>

                {/* Driver rating section */}
                <View style={styles.ratingSection}>
                    <Text style={[styles.ratingTitle, { color: colors.text.primary }]}>
                        ¿Cómo calificarías a tu conductor?
                    </Text>

                    <View style={styles.driverInfo}>
                        <Image
                            source={{ uri: tripData.driver.photo }}
                            style={styles.driverPhoto}
                            defaultSource={require('@/assets/images/icon.png')}
                        />
                        <Text style={[styles.driverName, { color: colors.text.primary }]}>
                            {tripData.driver.name}
                        </Text>
                    </View>

                    {/* Star rating */}
                    <View style={styles.starsContainer}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <TouchableOpacity
                                key={star}
                                onPress={() => setRating(star)}
                                style={styles.starButton}
                            >
                                <Ionicons
                                    name={star <= rating ? "star" : "star-outline"}
                                    size={36}
                                    color={star <= rating ? colors.warning : colors.text.secondary}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={[styles.ratingValue, { color: colors.text.primary }]}>
                        {rating}/5
                    </Text>

                    {/* Comment input */}
                    <TextInput
                        style={[
                            styles.commentInput,
                            {
                                backgroundColor: colors.background.secondary,
                                color: colors.text.primary,
                                borderColor: colors.border,
                            },
                        ]}
                        placeholder="Cuéntanos más sobre tu experiencia (opcional)"
                        placeholderTextColor={colors.text.tertiary}
                        multiline
                        numberOfLines={4}
                        value={comment}
                        onChangeText={setComment}
                    />

                    {/* Submit button */}
                    <TouchableOpacity
                        style={[styles.submitButton, { backgroundColor: colors.primary }]}
                        onPress={handleSubmitRating}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.submitButtonText}>Enviar calificación</Text>
                        )}
                    </TouchableOpacity>

                    {/* Skip button */}
                    <TouchableOpacity
                        style={styles.skipButton}
                        onPress={handleSkipRating}
                        disabled={isSubmitting}
                    >
                        <Text style={[styles.skipButtonText, { color: colors.text.secondary }]}>
                            Omitir calificación
                        </Text>
                    </TouchableOpacity>
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
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
    },
    backButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    backButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "500",
    },
    header: {
        alignItems: "center",
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        marginTop: 12,
    },
    summaryCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
    },
    tripInfo: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    tripDetail: {
        alignItems: "center",
    },
    tripDetailText: {
        marginTop: 4,
        fontSize: 14,
        fontWeight: "500",
    },
    divider: {
        height: 1,
        marginBottom: 16,
    },
    locations: {
        marginBottom: 16,
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    locationDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    locationText: {
        flex: 1,
    },
    locationTime: {
        fontSize: 12,
        marginBottom: 2,
    },
    locationAddress: {
        fontSize: 14,
        fontWeight: "500",
    },
    locationLine: {
        width: 1,
        height: 24,
        marginLeft: 6,
        marginBottom: 8,
    },
    tripDate: {
        textAlign: "center",
        fontSize: 14,
    },
    ratingSection: {
        alignItems: "center",
    },
    ratingTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center",
    },
    driverInfo: {
        alignItems: "center",
        marginBottom: 20,
    },
    driverPhoto: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 8,
        backgroundColor: "#e1e1e1",
    },
    driverName: {
        fontSize: 18,
        fontWeight: "500",
    },
    starsContainer: {
        flexDirection: "row",
        marginBottom: 8,
    },
    starButton: {
        padding: 8,
    },
    ratingValue: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 24,
    },
    commentInput: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        height: 100,
        textAlignVertical: "top",
        marginBottom: 24,
    },
    submitButton: {
        width: "100%",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 12,
    },
    submitButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    skipButton: {
        padding: 12,
    },
    skipButtonText: {
        fontSize: 14,
    },
});