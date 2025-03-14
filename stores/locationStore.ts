// stores/locationStore.ts
import { create } from 'zustand';
import { LocationService } from '@/services/location.service';

export interface Location {
    id?: string;
    latitude: number;
    longitude: number;
    name?: string;
    displayName?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
    };
}

interface LocationState {
    recentLocations: Location[];
    searchResults: Location[];
    isSearching: boolean;
    searchQuery: string;
    error: string | null;

    // Actions
    searchLocations: (query: string) => Promise<Location[]>;
    reverseGeocode: (latitude: number, longitude: number) => Promise<Location | null>;
    saveRecentLocation: (location: Location) => Promise<void>;
    getRecentLocations: () => Promise<void>;
    getRoute: (startCoords: [number, number], endCoords: [number, number]) => Promise<any>;
    setSearchQuery: (query: string) => void;
    clearSearchResults: () => void;
    clearError: () => void;
}

export const useLocationStore = create<LocationState>((set, get) => ({
    recentLocations: [],
    searchResults: [],
    isSearching: false,
    searchQuery: '',
    error: null,

    searchLocations: async (query: string) => {
        set({ isSearching: true, searchQuery: query });
        try {
            const results = await LocationService.searchLocations(query);
            set({ searchResults: results, isSearching: false });
            return results;
        } catch (error: any) {
            console.error('Error searching locations:', error);
            set({
                isSearching: false,
                error: error?.message || 'Failed to search locations'
            });
            return [];
        }
    },

    reverseGeocode: async (latitude: number, longitude: number) => {
        try {
            const location = await LocationService.reverseGeocode(latitude, longitude);
            return location;
        } catch (error: any) {
            console.error('Error reverse geocoding:', error);
            set({ error: error?.message || 'Failed to get location from coordinates' });
            return null;
        }
    },

    saveRecentLocation: async (location: Location) => {
        try {
            await LocationService.saveRecentLocation(location);
            await get().getRecentLocations();
        } catch (error: any) {
            console.error('Error saving recent location:', error);
            set({ error: error?.message || 'Failed to save recent location' });
        }
    },

    getRecentLocations: async () => {
        try {
            const recentLocations = await LocationService.getRecentLocations();
            set({ recentLocations });
        } catch (error: any) {
            console.error('Error getting recent locations:', error);
            set({ error: error?.message || 'Failed to get recent locations' });
        }
    },

    getRoute: async (startCoords: [number, number], endCoords: [number, number]) => {
        try {
            return await LocationService.getRoute(startCoords, endCoords);
        } catch (error: any) {
            console.error('Error fetching route:', error);
            set({ error: error?.message || 'Failed to get route' });
            throw error;
        }
    },

    setSearchQuery: (query: string) => set({ searchQuery: query }),

    clearSearchResults: () => set({ searchResults: [], searchQuery: '' }),

    clearError: () => set({ error: null })
}));