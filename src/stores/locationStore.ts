// src/stores/locationStore.ts (Actualizado)
import { create } from 'zustand';
import { locationService } from '@/src/services';
import { Location } from '@/src/services';

interface LocationState {
    recentLocations: Location[];
    searchResults: Location[];
    isSearching: boolean;
    searchQuery: string;
    error: string | null;

    // Acciones
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
            const results = await locationService.searchLocations(query);
            set({ searchResults: results, isSearching: false });
            return results;
        } catch (error: any) {
            console.error('Error buscando ubicaciones:', error);
            set({
                isSearching: false,
                error: error?.message || 'Error al buscar ubicaciones'
            });
            return [];
        }
    },

    reverseGeocode: async (latitude: number, longitude: number) => {
        try {
            const location = await locationService.reverseGeocode(latitude, longitude);
            return location;
        } catch (error: any) {
            console.error('Error en geocodificación inversa:', error);
            set({ error: error?.message || 'Error al obtener ubicación de coordenadas' });
            return null;
        }
    },

    saveRecentLocation: async (location: Location) => {
        try {
            await locationService.saveRecentLocation(location);
            await get().getRecentLocations();
        } catch (error: any) {
            console.error('Error guardando ubicación reciente:', error);
            set({ error: error?.message || 'Error al guardar ubicación reciente' });
        }
    },

    getRecentLocations: async () => {
        try {
            const recentLocations = await locationService.getRecentLocations();
            set({ recentLocations });
        } catch (error: any) {
            console.error('Error obteniendo ubicaciones recientes:', error);
            set({ error: error?.message || 'Error al obtener ubicaciones recientes' });
        }
    },

    getRoute: async (startCoords: [number, number], endCoords: [number, number]) => {
        try {
            return await locationService.getRoute(startCoords, endCoords);
        } catch (error: any) {
            console.error('Error obteniendo ruta:', error);
            set({ error: error?.message || 'Error al obtener ruta' });
            throw error;
        }
    },

    setSearchQuery: (query: string) => set({ searchQuery: query }),

    clearSearchResults: () => set({ searchResults: [], searchQuery: '' }),

    clearError: () => set({ error: null })
}));

// Re-exportamos el tipo Location para que esté disponible al importar desde el store
export type { Location };