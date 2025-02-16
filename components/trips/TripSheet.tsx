// TripSheet.tsx
import React, { useState } from "react";
import { View, StyleSheet, Pressable, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme/ThemeContext";
import BottomSheet from "../common/BottomSheet";
import RecentTrips from "../passenger/RecentTrips";
import LocationInput from "./LocationInput";
import SearchMode from "./SearchMode";
import { LocationService } from "@/services/location.service";

interface TripSheetProps {
    expanded: boolean;
    onExpandedChange: (expanded: boolean) => void;
    onLocationSelect: (type: "origin" | "destination", location: any) => void;
    origin?: { name: string };
    destination?: { name: string };
}

const COLLAPSED_HEIGHT = 120;
const EXPANDED_HEIGHT = 450;

const TripSheet: React.FC<TripSheetProps> = ({
    expanded,
    onExpandedChange,
    onLocationSelect,
    origin,
    destination,
}) => {
    const { colors } = useTheme();
    const [activeSearchType, setActiveSearchType] = useState<"origin" | "destination" | null>(null);

    const recentTrips = [
        {
            id: "1",
            name: "Oficina",
            address: "Calle Principal 123",
            frequency: "3 veces/semana",
        },
        {
            id: "2",
            name: "Casa",
            address: "Av. Libertad 456",
            frequency: "2 veces/semana",
        },
    ];

    const handleLocationSelect = async (location: any) => {
        if (!activeSearchType) return;
        onLocationSelect(activeSearchType, location);
        await LocationService.saveRecentLocation(location);
        setActiveSearchType(null);
    };

    const handleLocationInputPress = (type: "origin" | "destination") => {
        setActiveSearchType(type);
        onExpandedChange(true);
    };

    const handleSelectManually = () => {
        if (!activeSearchType) return;
        onLocationSelect(activeSearchType, null);
        setActiveSearchType(null);
    };

    const renderDefaultMode = () => (
        <>
            <View style={styles.locationInputs}>
                <LocationInput
                    type="origin"
                    label={origin?.name || "Tu ubicación"}
                    onPress={() => handleLocationInputPress("origin")}
                    dotColor={colors.success}
                />
                <LocationInput
                    type="destination"
                    label={destination?.name || "¿A dónde vas?"}
                    onPress={() => handleLocationInputPress("destination")}
                    dotColor={colors.error}
                />
            </View>
            <View style={styles.recentSearches}>
                <RecentTrips trips={recentTrips} />
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
                                // Si existe destino, se muestra el nombre (o un mensaje personalizado)
                                <Text style={[styles.searchText, { color: colors.text.secondary }]}>
                                    {destination.name}
                                </Text>
                            ) : (
                                <Text style={[styles.searchText, { color: colors.text.secondary }]}>
                                    ¿A dónde vas?
                                </Text>
                            )}
                        </Pressable>
                    </View>
                ) : (
                    <ScrollView style={styles.expandedContent}>
                        {activeSearchType ? (
                            <SearchMode
                                activeSearchType={activeSearchType}
                                onBack={() => setActiveSearchType(null)}
                                onSelectLocation={handleLocationSelect}
                                onSelectManually={handleSelectManually}
                            />
                        ) : (
                            renderDefaultMode()
                        )}
                    </ScrollView>
                )}
            </View>
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
    locationInputs: {
        marginBottom: 24,
    },
    recentSearches: {
        flex: 1,
    },
});

export default TripSheet;
