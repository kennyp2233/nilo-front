// components/SearchMode.tsx
import React, { useEffect, useRef } from "react";
import { View, Pressable, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { Location } from "@/stores/locationStore";

interface SearchModeProps {
    activeSearchType: "origin" | "destination";
    onBack: () => void;
    onSelectLocation: (location: Location) => void;
    onSelectManually: () => void;
    searchQuery: string;
    searchResults: Location[];
    isSearching: boolean;
    onSearchChange: (query: string) => void;
}

const SearchMode: React.FC<SearchModeProps> = ({
    activeSearchType,
    onBack,
    onSelectLocation,
    onSelectManually,
    searchQuery,
    searchResults,
    isSearching,
    onSearchChange,
}) => {
    const { colors } = useTheme();
    const inputRef = useRef<TextInput>(null);

    // Focus input when component mounts
    useEffect(() => {
        // Small delay to ensure the component is fully rendered
        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Format location address for display
    const formatAddress = (location: Location) => {
        if (location.displayName) return location.displayName;

        if (location.address) {
            const parts = [];
            if (location.address.street) parts.push(location.address.street);
            if (location.address.city) parts.push(location.address.city);
            if (location.address.state) parts.push(location.address.state);
            if (parts.length > 0) return parts.join(", ");
        }

        return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
    };

    // Format location name for display
    const formatName = (location: Location) => {
        return location.name || "Ubicación";
    };

    // Direct handler without the need for debounce (will be handled in hook)
    const handleTextChange = (text: string) => {
        console.log("Search text changed:", text);
        onSearchChange(text);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <View style={styles.searchMode}>
                <View style={styles.searchHeader}>
                    <Pressable onPress={onBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                    </Pressable>
                    <View style={[styles.searchInput, { backgroundColor: colors.background.secondary }]}>
                        <Ionicons name="search" size={20} color={colors.text.secondary} />
                        <TextInput
                            ref={inputRef}
                            style={[styles.input, { color: colors.text.primary }]}
                            placeholder={`Buscar ${activeSearchType === "origin" ? "origen" : "destino"}`}
                            value={searchQuery}
                            onChangeText={handleTextChange}
                            placeholderTextColor={colors.text.secondary}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                            keyboardType="default"
                        />
                        {isSearching && (
                            <ActivityIndicator size="small" color={colors.primary} />
                        )}
                    </View>
                </View>

                <ScrollView
                    style={styles.searchResults}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.resultsContent}
                >
                    {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                            <Pressable
                                key={result.id || `${result.latitude}-${result.longitude}`}
                                style={[styles.resultItem, { borderBottomColor: colors.border }]}
                                onPress={() => onSelectLocation(result)}
                            >
                                <Ionicons name="location" size={20} color={colors.text.secondary} />
                                <View style={styles.resultText}>
                                    <Text style={[styles.resultTitle, { color: colors.text.primary }]}>
                                        {formatName(result)}
                                    </Text>
                                    <Text style={[styles.resultAddress, { color: colors.text.secondary }]}>
                                        {formatAddress(result)}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    ) : searchQuery.length >= 3 && !isSearching ? (
                        <View style={styles.noResults}>
                            <Ionicons name="search-outline" size={24} color={colors.text.secondary} />
                            <Text style={[styles.noResultsText, { color: colors.text.secondary }]}>
                                No se encontraron resultados
                            </Text>
                        </View>
                    ) : null}

                    {/* Opción para seleccionar manualmente */}
                    <Pressable
                        style={[styles.manualSelection, { borderTopColor: colors.border }]}
                        onPress={onSelectManually}
                    >
                        <Ionicons name="navigate" size={20} color={colors.text.secondary} />
                        <Text style={[styles.manualSelectionText, { color: colors.text.primary }]}>
                            Seleccionar ubicación en el mapa
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    searchMode: {
        flex: 1,
    },
    searchHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    searchInput: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        flex: 1,
        marginLeft: 8,
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        padding: 0,
        height: 24, // Fixed height to prevent resizing issues
    },
    searchResults: {
        marginTop: 8,
        flex: 1,
    },
    resultsContent: {
        paddingBottom: 20,
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
    },
    resultText: {
        flex: 1,
        marginLeft: 12,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 4,
    },
    resultAddress: {
        fontSize: 14,
    },
    noResults: {
        alignItems: "center",
        padding: 24,
        gap: 8,
    },
    noResultsText: {
        fontSize: 16,
    },
    manualSelection: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderTopWidth: 1,
    },
    manualSelectionText: {
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 12,
    },
});

export default SearchMode;