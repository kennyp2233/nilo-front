// components/SearchMode.tsx
import React from "react";
import { View, Pressable, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import { useLocationSearch } from "@/hooks/useLocationSearch";

interface SearchModeProps {
    activeSearchType: "origin" | "destination";
    onBack: () => void;
    onSelectLocation: (location: any) => void;
    onSelectManually: () => void;
}

const SearchMode: React.FC<SearchModeProps> = ({
    activeSearchType,
    onBack,
    onSelectLocation,
    onSelectManually,
}) => {
    const { colors } = useTheme();
    const { searchQuery, searchResults, handleSearch } = useLocationSearch();

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
                        onChangeText={handleSearch}
                        placeholderTextColor={colors.text.secondary}
                        autoFocus
                    />
                </View>
            </View>

            <ScrollView style={styles.searchResults}>
                {searchResults.map((result) => (
                    <Pressable
                        key={result.id}
                        style={styles.resultItem}
                        onPress={() => onSelectLocation(result)}
                    >
                        <Ionicons name="location" size={20} color={colors.text.secondary} />
                        <View style={styles.resultText}>
                            <Text style={[styles.resultTitle, { color: colors.text.primary }]}>
                                {result.name}
                            </Text>
                            <Text style={[styles.resultAddress, { color: colors.text.secondary }]}>
                                {result.displayName}
                            </Text>
                        </View>
                    </Pressable>
                ))}

                {/* Opción para seleccionar manualmente */}
                <Pressable style={styles.manualSelection} onPress={onSelectManually}>
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
        borderBottomColor: "#E5E5EA",
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
    manualSelection: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#E5E5EA",
    },
    manualSelectionText: {
        fontSize: 16,
        fontWeight: "500",
    },
});

export default SearchMode;
