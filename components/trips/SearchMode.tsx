// components/SearchMode.tsx
import React from "react";
import { View, Pressable, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
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

    return (
        <View style={styles.searchMode}>
            <View style={styles.searchHeader}>
                <Pressable onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>
                <View style={[styles.searchInput, { backgroundColor: colors.background.secondary }]}>
                    <Ionicons name="search" size={20} color={colors.text.secondary} />
                    <TextInput
                        style={[styles.input, { color: colors.text.primary }]}
                        placeholder={`Buscar ${activeSearchType === "origin" ? "origen" : "destino"}`}
                        value={searchQuery}
                        onChangeText={onSearchChange}
                        placeholderTextColor={colors.text.secondary}
                        autoFocus
                    />
                    {isSearching && (
                        <ActivityIndicator size="small" color={colors.primary} />
                    )}
                </View>
            </View>

            <ScrollView style={styles.searchResults}>
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
                                    {result.name || "Ubicación"}
                                </Text>
                                <Text style={[styles.resultAddress, { color: colors.text.secondary }]}>
                                    {result.displayName ||
                                        (result.address ?
                                            `${result.address.street || ''}, ${result.address.city || ''}` :
                                            `${result.latitude.toFixed(5)}, ${result.longitude.toFixed(5)}`)}
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
    },
    input: {
        flex: 1,
        marginLeft: 8,
        fontSize: 16,
        padding: 0,
    },
    searchResults: {
        marginTop: 8,
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