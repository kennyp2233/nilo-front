// TripSheet.tsx
import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Text, ScrollView, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/src/theme/ThemeContext";
import BottomSheet from "../common/BottomSheet";
import RecentTrips from "../passenger/RecentTrips";
import LocationInput from "./LocationInput";
import SearchMode from "./SearchMode";
import { Location } from "@/src/stores/locationStore";
import { useLocation } from "@/src/hooks/useLocation";

interface TripSheetProps {
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    onLocationSelect: (type: "origin" | "destination", location: Location | null) => void;
    origin?: Location | null;
    destination?: Location | null;
    onRequestTrip?: () => void;
    isLoading?: boolean;
}

// Increase the expanded height to allow more space for scrolling
const COLLAPSED_HEIGHT = 120;
const EXPANDED_HEIGHT = 520; // Further increased for better visibility

const TripSheet: React.FC<TripSheetProps> = ({
    expanded,
    onExpandedChange,
    onLocationSelect,
    origin,
    destination,
    onRequestTrip,
    isLoading = false
}) => {
    const { colors } = useTheme();
    const [activeSearchType, setActiveSearchType] = useState<"origin" | "destination" | null>(null);
    const {
        recentLocations,
        handleSearchChange,
        searchResults,
        searchQuery,
        isSearching,
        clearSearchResults
    } = useLocation();

    // Reset search when search type changes or is closed
    useEffect(() => {
        if (!activeSearchType) {
            clearSearchResults();
        }
    }, [activeSearchType]);

    const handleLocationInputPress = (type: "origin" | "destination") => {
        setActiveSearchType(type);
        onExpandedChange(true);
    };

    const handleLocationSelection = (location: Location) => {
        if (!activeSearchType) return;

        console.log("Selected location:", location);
        onLocationSelect(activeSearchType, location);
        setActiveSearchType(null);
    };

    const handleSelectManually = () => {
        if (!activeSearchType) return;

        console.log("Selecting location manually for:", activeSearchType);
        onLocationSelect(activeSearchType, null);
        setActiveSearchType(null);
        onExpandedChange(false);
    };

    const handleBackFromSearch = () => {
        setActiveSearchType(null);
        clearSearchResults();
    };

    // Format location display name for readability
    const getLocationDisplayName = (location: Location | null | undefined) => {
        if (!location) return "";

        if (location.displayName) return location.displayName;

        if (location.address) {
            const addressParts = [];
            if (location.address.street) addressParts.push(location.address.street);
            if (location.address.city) addressParts.push(location.address.city);
            if (addressParts.length > 0) return addressParts.join(", ");
        }

        return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    };

    // Get location name, using a meaningful fallback if needed
    const getLocationName = (location: Location | null | undefined, defaultName: string) => {
        if (!location) return defaultName;
        return location.name || defaultName;
    };

    const renderTripSummary = () => {
        if (!origin || !destination) return null;

        return (
            <View style={[styles.tripSummary, { backgroundColor: colors.background.secondary }]}>
                <View style={styles.tripDetails}>
                    <View style={styles.tripInfo}>
                        <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
                        <Text style={[styles.tripInfoText, { color: colors.text.primary }]}>
                            15 min (estimado)
                        </Text>
                    </View>
                    <View style={styles.tripInfo}>
                        <Ionicons name="speedometer-outline" size={18} color={colors.text.secondary} />
                        <Text style={[styles.tripInfoText, { color: colors.text.primary }]}>
                            5.2 km
                        </Text>
                    </View>
                </View>
                <View style={styles.tripPrice}>
                    <Text style={[styles.tripPriceLabel, { color: colors.text.secondary }]}>
                        Precio estimado:
                    </Text>
                    <Text style={[styles.tripPriceValue, { color: colors.text.primary }]}>
                        $8.50
                    </Text>
                </View>
            </View>
        );
    };

    const renderRequestButton = () => {
        if (!origin || !destination) return null;

        return (
            <TouchableOpacity
                style={[styles.requestButton, { backgroundColor: colors.primary }]}
                onPress={onRequestTrip}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={colors.background.primary} />
                ) : (
                    <>
                        <Ionicons name="car" size={20} color={colors.background.primary} />
                        <Text style={[styles.requestButtonText, { color: colors.background.primary }]}>
                            Solicitar NILO
                        </Text>
                    </>
                )}
            </TouchableOpacity>
        );
    };

    const renderDefaultMode = () => (
        <>
            <View style={styles.locationInputs}>
                <LocationInput
                    type="origin"
                    label={getLocationName(origin, "Tu ubicación")}
                    displayName={getLocationDisplayName(origin)}
                    onPress={() => handleLocationInputPress("origin")}
                    dotColor={colors.success}
                />
                <LocationInput
                    type="destination"
                    label={getLocationName(destination, "¿A dónde vas?")}
                    displayName={getLocationDisplayName(destination)}
                    onPress={() => handleLocationInputPress("destination")}
                    dotColor={colors.error}
                />
            </View>

            {renderTripSummary()}
            {renderRequestButton()}

            <View style={styles.recentSearches}>
                <Text style={[styles.recentTitle, { color: colors.text.primary }]}>
                    Lugares recientes
                </Text>
                {recentLocations.length > 0 ? (
                    <RecentTrips trips={recentLocations.map((loc, index) => ({
                        id: loc.id || index.toString(),
                        name: loc.name || "Ubicación guardada",
                        address: loc.displayName || (loc.address ?
                            `${loc.address.street || ''}, ${loc.address.city || ''}` :
                            `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`),
                        frequency: ""
                    }))} />
                ) : (
                    <Text style={[styles.noRecents, { color: colors.text.secondary }]}>
                        No hay lugares recientes
                    </Text>
                )}
            </View>
        </>
    );

    return (
        <BottomSheet
            expanded={expanded}
            onExpandedChange={onExpandedChange}
            expandedHeight={EXPANDED_HEIGHT}
            collapsedHeight={COLLAPSED_HEIGHT}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <View style={[styles.sheetContent, { backgroundColor: colors.background.primary }]}>
                    <View style={styles.dragIndicator} />
                    {!expanded ? (
                        <View style={styles.collapsedContent}>
                            <Pressable
                                style={[styles.searchBar, { backgroundColor: colors.background.secondary }]}
                                onPress={() => {
                                    onExpandedChange(true);
                                    setActiveSearchType("destination");
                                }}
                            >
                                <Ionicons name="search" size={20} color={colors.text.secondary} />
                                {destination ? (
                                    <Text style={[styles.searchText, { color: colors.text.secondary }]}>
                                        {destination.name || "Destino seleccionado"}
                                    </Text>
                                ) : (
                                    <Text style={[styles.searchText, { color: colors.text.secondary }]}>
                                        ¿A dónde vas?
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    ) : (
                        <View style={styles.expandedContent}>
                            {activeSearchType ? (
                                <SearchMode
                                    activeSearchType={activeSearchType}
                                    onBack={handleBackFromSearch}
                                    onSelectLocation={handleLocationSelection}
                                    onSelectManually={handleSelectManually}
                                    searchQuery={searchQuery}
                                    searchResults={searchResults}
                                    isSearching={isSearching}
                                    onSearchChange={handleSearchChange}
                                />
                            ) : (
                                <ScrollView
                                    style={styles.defaultModeScrollView}
                                    contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                                    nestedScrollEnabled={true}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {renderDefaultMode()}
                                </ScrollView>
                            )}
                        </View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </BottomSheet>
    );
};

const styles = StyleSheet.create({
    sheetContent: {
        padding: 16,
        height: "100%",
    },
    dragIndicator: {
        alignSelf: "center",
        width: 40,
        height: 4,
        backgroundColor: "#CCCCCC",
        borderRadius: 2,
        marginBottom: 16,
    },
    collapsedContent: {
        height: COLLAPSED_HEIGHT - 32,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
    },
    searchText: {
        fontSize: 16,
        marginLeft: 8,
    },
    expandedContent: {
        flex: 1,
    },
    defaultModeScrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    locationInputs: {
        marginBottom: 16,
    },
    tripSummary: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    tripDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    tripInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    tripInfoText: {
        fontSize: 14,
    },
    tripPrice: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 8,
    },
    tripPriceLabel: {
        fontSize: 14,
    },
    tripPriceValue: {
        fontSize: 18,
        fontWeight: "600",
    },
    requestButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        borderRadius: 8,
        marginBottom: 24,
        gap: 8,
    },
    requestButtonText: {
        fontSize: 16,
        fontWeight: "600",
    },
    recentSearches: {
        flex: 1,
    },
    recentTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
    },
    noRecents: {
        textAlign: "center",
        padding: 16,
        fontSize: 14,
    },
});

export default TripSheet;