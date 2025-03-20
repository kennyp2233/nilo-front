// src/services/api/endpoints/locationEndpoints.ts
import { apiClient } from '../apiClient';
import { Location } from './tripEndpoints';

/**
 * Servicio de endpoints para ubicaciones
 */
export const locationEndpoints = {
    /**
     * Busca ubicaciones por término de búsqueda
     */
    searchLocations: async (
        query: string,
        limit = 5,
        countryCode = 'EC'
    ): Promise<Location[]> => {
        return apiClient.get<Location[]>('/geocoding/search', {
            query,
            limit,
            countryCode
        });
    },

    /**
     * Convierte coordenadas en dirección (geocodificación inversa)
     */
    reverseGeocode: async (
        latitude: number,
        longitude: number
    ): Promise<Location> => {
        return apiClient.get<Location>('/geocoding/reverse', {
            latitude,
            longitude
        });
    },

    /**
     * Obtiene ruta entre dos puntos
     */
    getRoute: async (
        start: [number, number],
        end: [number, number]
    ): Promise<any> => {
        return apiClient.get<any>('/ors/route', {
            start: start.join(','),
            end: end.join(','),
        });
    },

    /**
     * Guarda una ubicación favorita del usuario
     */
    saveFavoriteLocation: async (location: Location, name: string): Promise<any> => {
        return apiClient.post<any>('/users/locations/favorites', {
            ...location,
            name
        });
    },

    /**
     * Obtiene ubicaciones favoritas del usuario
     */
    getFavoriteLocations: async (): Promise<Location[]> => {
        return apiClient.get<Location[]>('/users/locations/favorites');
    },

    /**
     * Elimina una ubicación favorita
     */
    deleteFavoriteLocation: async (locationId: string): Promise<void> => {
        return apiClient.delete<void>(`/users/locations/favorites/${locationId}`);
    }
};