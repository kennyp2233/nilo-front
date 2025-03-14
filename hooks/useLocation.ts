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
            await searchLocations(query);
        }, 500),
        []
    );

    // Handle search input change
    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        if (query.length < 3) {
            clearSearchResults();
            return;
        }
        debouncedSearch(query);
    };

    // Handle selecting a location from search results or map
    const handleLocationSelect = async (location: Location) => {
        await saveRecentLocation(location);
        return location;
    };

    // Get location from coordinates (e.g., when selecting on map)
    const getLocationFromCoordinates = async (coords: { latitude: number; longitude: number }) => {
        const location = await reverseGeocode(coords.latitude, coords.longitude);
        if (location) {
            await saveRecentLocation(location);
        }
        return location;
    };

    // Get route between two points
    const calculateRoute = async (origin: Location, destination: Location) => {
        if (!origin || !destination) return null;

        try {
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