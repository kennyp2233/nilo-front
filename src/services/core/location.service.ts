// src/services/core/locationService.ts
import { api } from '../api';
import { storageService } from './storageService';
import { Location } from '../api/endpoints/tripEndpoints';

/**
 * Servicio para gestionar ubicaciones
 * Se encarga de interactuar con la API de ubicaciones y gestionar el almacenamiento local
 */
export const locationService = {
    /**
     * Busca ubicaciones por texto
     */
    async searchLocations(query: string, limit = 5, countryCode = 'EC'): Promise<Location[]> {
        try {
            console.log('Buscando ubicaciones con query:', query);
            return await api.locations.searchLocations(query, limit, countryCode);
        } catch (error) {
            console.error('Error buscando ubicaciones:', error);
            return [];
        }
    },

    /**
     * Geocodificación inversa: convierte coordenadas en dirección
     */
    async reverseGeocode(latitude: number, longitude: number): Promise<Location | null> {
        try {
            console.log('Geocodificación inversa de coordenadas:', latitude, longitude);
            const response = await api.locations.reverseGeocode(latitude, longitude);
            console.log('Respuesta de geocodificación inversa:', response);

            // Si la respuesta existe, devuelve un objeto Location formateado correctamente
            if (response) {
                return {
                    id: response.id?.toString(),
                    latitude: response.latitude,
                    longitude: response.longitude,
                    name: response.name || 'Ubicación marcada',
                    displayName: response.displayName,
                    address: response.address
                };
            }
            return null;
        } catch (error) {
            console.error('Error en geocodificación inversa:', error);
            return null;
        }
    },

    /**
     * Guarda una ubicación en ubicaciones recientes
     */
    async saveRecentLocation(location: Location): Promise<void> {
        try {
            // Primero, guardar en almacenamiento local
            await storageService.recentLocations.add(location);
            console.log('Ubicación guardada en ubicaciones recientes:', location);

            // Si hay un token, también guardar en el backend (opcional)
            const token = await storageService.getItem<string>('auth_token');
            if (token) {
                try {
                    // Esta llamada dependería de tener un endpoint para guardar ubicaciones recientes
                    // Por ahora solo registramos la intención
                    console.log('Se podría guardar en el backend si el endpoint estuviera disponible:', location);
                } catch (error) {
                    console.error('Error guardando ubicación en el backend:', error);
                }
            }
        } catch (error) {
            console.error('Error guardando ubicación reciente:', error);
        }
    },

    /**
     * Obtiene ubicaciones recientes
     */
    async getRecentLocations(): Promise<Location[]> {
        try {
            const locations = await storageService.recentLocations.getAll();
            console.log('Ubicaciones recientes recuperadas:', locations.length);
            return locations;
        } catch (error) {
            console.error('Error obteniendo ubicaciones recientes:', error);
            return [];
        }
    },

    /**
     * Mejora una ubicación con mejor información de nombre
     */
    enhanceLocationData(location: Location): Location {
        const enhanced = { ...location };

        // Asegurar que tenemos un nombre
        if (!enhanced.name) {
            if (enhanced.address?.street) {
                enhanced.name = enhanced.address.street;
            } else if (enhanced.displayName) {
                // Extraer parte significativa del displayName si es posible
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

        // Asegurar que tenemos un displayName
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
    },

    /**
     * Obtiene una ubicación a partir de coordenadas
     */
    async getLocationFromCoordinates(coords: { latitude: number; longitude: number }): Promise<Location | null> {
        try {
            console.log("Obteniendo ubicación desde coordenadas:", coords);
            const location = await this.reverseGeocode(coords.latitude, coords.longitude);

            if (location) {
                console.log("Ubicación encontrada:", location);
                const enhancedLocation = this.enhanceLocationData(location);
                await this.saveRecentLocation(enhancedLocation);
                return enhancedLocation;
            } else {
                // Si no se obtiene una ubicación del servidor, crear una ubicación fallback
                console.log("No se encontró ubicación desde la API, creando ubicación alternativa");
                const fallbackLocation: Location = {
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    name: "Ubicación seleccionada",
                    displayName: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
                };
                await this.saveRecentLocation(fallbackLocation);
                return fallbackLocation;
            }
        } catch (error) {
            console.error('Error en getLocationFromCoordinates:', error);
            // Crear ubicación fallback en caso de error
            const fallbackLocation: Location = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                name: "Ubicación seleccionada",
                displayName: `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`
            };
            return fallbackLocation;
        }
    },

    /**
     * Obtiene ruta entre dos puntos
     */
    async getRoute(startCoords: [number, number], endCoords: [number, number]): Promise<any> {
        try {
            console.log('Obteniendo ruta desde:', startCoords, 'hasta:', endCoords);
            return await api.locations.getRoute(startCoords, endCoords);
        } catch (error) {
            console.error('Error obteniendo ruta:', error);
            throw error;
        }
    }
};