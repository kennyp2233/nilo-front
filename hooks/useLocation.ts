// hooks/useLocation.ts
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocationStore, Location } from '@/stores/locationStore';

export function useLocation() {
    const {
        recentLocations,
        searchResults,
        isSearching,
        searchQuery,
        error,
        searchLocations,
        reverseGeocode,
        saveRecentLocation,
        getRecentLocations,
        getRoute,
        setSearchQuery,
        clearSearchResults,
        clearError
    } = useLocationStore();

    // Keep track of the latest search query to avoid race conditions
    const latestQuery = useRef('');
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Initialize by loading recent locations
    useEffect(() => {
        getRecentLocations();
    }, []);

    // Handle search input change with manual debounce
    const handleSearchChange = useCallback((query: string) => {
        // Update state immediately for UI feedback
        setSearchQuery(query);
        latestQuery.current = query;

        // Clear previous timeout if it exists
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = null;
        }

        if (query.length < 3) {
            return;
        }

        // Set a new timeout
        searchTimeout.current = setTimeout(async () => {
            // Only perform the search if the query is still the same
            if (latestQuery.current === query) {
                console.log("Executing search for:", query);
                await searchLocations(query);
            }
        }, 500);
    }, [setSearchQuery, clearSearchResults, searchLocations]);

    // Enhance location with better naming before saving
    const enhanceLocationData = (location: Location): Location => {
        const enhanced = { ...location };

        // Ensure we have a name
        if (!enhanced.name) {
            if (enhanced.address?.street) {
                enhanced.name = enhanced.address.street;
            } else if (enhanced.displayName) {
                // Extract meaningful part from displayName if possible
                const parts = enhanced.displayName.split(',');
                if (parts.length > 0) {
                    enhanced.name = parts[0].trim();
                } else {
                    enhanced.name = "Ubicación";
                }
            } else {
                enhanced.name = "Ubicación";
            }
        }

        // Ensure we have a displayName
        if (!enhanced.displayName) {
            if (enhanced.address) {
                const addressParts = [];
                if (enhanced.address.street) addressParts.push(enhanced.address.street);
                if (enhanced.address.city) addressParts.push(enhanced.address.city);
                if (enhanced.address.state) addressParts.push(enhanced.address.state);

                if (addressParts.length > 0) {
                    enhanced.displayName = addressParts.join(", ");
                } else {
                    enhanced.displayName = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
                }
            } else {
                enhanced.displayName = `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
            }
        }

        return enhanced;
    };

    // Handle selecting a location from search results or map
    const handleLocationSelect = async (location: Location) => {
        console.log("Location selected:", location);
        const enhancedLocation = enhanceLocationData(location);
        await saveRecentLocation(enhancedLocation);
        return enhancedLocation;
    };

    // Get location from coordinates (e.g., when selecting on map)
    const getLocationFromCoordinates = async (coords: { latitude: number; longitude: number }) => {
        console.log("Getting location from coordinates:", coords);
        try {
            const location = await reverseGeocode(coords.latitude, coords.longitude);

            if (location) {
                console.log("Location found:", location);
                const enhancedLocation = enhanceLocationData(location);
                await saveRecentLocation(enhancedLocation);
                return enhancedLocation;
            } else {
                // Si no se obtiene una ubicación del servidor, crear una ubicación fallback
                console.log("No location found from API, creating fallback location");
                const fallbackLocation: Location = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    name: "Ubicación seleccionada",
                    displayName: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
                };
                await saveRecentLocation(fallbackLocation);
                return fallbackLocation;
            }
        } catch (error) {
            console.error('Error in getLocationFromCoordinates:', error);
            // Crear ubicación fallback en caso de error
            const fallbackLocation: Location = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                name: "Ubicación seleccionada",
                displayName: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
            };
            return fallbackLocation;
        }
    };

    // Get route between two points
    const calculateRoute = async (origin: Location, destination: Location) => {
        if (!origin || !destination) return null;

        try {
            console.log("Calculating route from", origin, "to", destination);
            return await getRoute(
                [origin.latitude, origin.longitude],
                [destination.latitude, destination.longitude]
            );
        } catch (error) {
            console.error('Error calculating route:', error);
            return null;
        }
    };

    // Cleanup function to clear any pending timeouts
    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
                searchTimeout.current = null;
            }
        };
    }, []);

    return {
        // State
        recentLocations,
        searchResults,
        isSearching,
        searchQuery,
        error,

        // Actions
        handleSearchChange,
        handleLocationSelect,
        getLocationFromCoordinates,
        calculateRoute,
        clearSearchResults,
        clearError
    };
}