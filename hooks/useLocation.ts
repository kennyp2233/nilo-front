// hooks/useLocation.ts
import { useCallback, useEffect, useState } from 'react';
import { useLocationStore, Location } from '@/stores/locationStore';
import { debounce } from 'lodash';

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

    // Initialize by loading recent locations
    useEffect(() => {
        getRecentLocations();
    }, []);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (query.length < 3) return;
            console.log("Performing debounced search:", query);
            await searchLocations(query);
        }, 300),
        []
    );

    // Handle search input change
    const handleSearchChange = useCallback((query: string) => {
        console.log("Search query changed:", query);
        setSearchQuery(query);

        if (query.length < 3) {
            clearSearchResults();
            return;
        }

        debouncedSearch(query);
    }, [setSearchQuery, clearSearchResults, debouncedSearch]);

    // Handle selecting a location from search results or map
    const handleLocationSelect = async (location: Location) => {
        console.log("Location selected:", location);
        await saveRecentLocation(location);
        return location;
    };

    // Get location from coordinates (e.g., when selecting on map)
    const getLocationFromCoordinates = async (coords: { latitude: number; longitude: number }) => {
        console.log("Getting location from coordinates:", coords);
        try {
            const location = await reverseGeocode(coords.latitude, coords.longitude);

            if (location) {
                console.log("Location found:", location);
                await saveRecentLocation(location);
                return location;
            } else {
                // Si no se obtiene una ubicación del servidor, crear una ubicación fallback
                console.log("No location found from API, creating fallback location");
                const fallbackLocation: Location = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    name: "Ubicación marcada",
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
                name: "Ubicación marcada",
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