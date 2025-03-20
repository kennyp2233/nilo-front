// src/hooks/useLocation.ts (Refactorizado)
import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocationStore, Location } from '@/src/stores/locationStore';
import { locationService } from '../services/core/location.service';
/**
 * Hook para gestionar ubicaciones
 * Proporciona funciones para buscar, seleccionar y gestionar ubicaciones
 */
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

    // Controlar la última búsqueda para evitar condiciones de carrera
    const latestQuery = useRef('');
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Inicializar cargando ubicaciones recientes
    useEffect(() => {
        getRecentLocations();
    }, []);

    /**
     * Maneja cambios en la entrada de búsqueda con debounce manual
     */
    const handleSearchChange = useCallback((query: string) => {
        // Actualizar estado inmediatamente para feedback de UI
        setSearchQuery(query);
        latestQuery.current = query;

        // Limpiar timeout previo si existe
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
            searchTimeout.current = null;
        }

        if (query.length < 3) {
            return;
        }

        // Configurar nuevo timeout
        searchTimeout.current = setTimeout(async () => {
            // Solo realizar la búsqueda si la consulta sigue siendo la misma
            if (latestQuery.current === query) {
                console.log("Ejecutando búsqueda para:", query);
                await searchLocations(query);
            }
        }, 500);
    }, [setSearchQuery, clearSearchResults, searchLocations]);

    /**
     * Maneja la selección de una ubicación de resultados de búsqueda o mapa
     */
    const handleLocationSelect = async (location: Location) => {
        console.log("Ubicación seleccionada:", location);
        const enhancedLocation = locationService.enhanceLocationData(location);
        await saveRecentLocation(enhancedLocation);
        return enhancedLocation;
    };

    /**
     * Obtiene ubicación a partir de coordenadas (al seleccionar en el mapa)
     */
    const getLocationFromCoordinates = async (coords: { latitude: number; longitude: number }) => {
        console.log("Obteniendo ubicación desde coordenadas:", coords);
        try {
            const location = await locationService.getLocationFromCoordinates(coords);
            return location;
        } catch (error) {
            console.error('Error en getLocationFromCoordinates:', error);
            return null;
        }
    };

    /**
     * Calcula ruta entre dos puntos
     */
    const calculateRoute = async (origin: Location, destination: Location) => {
        if (!origin || !destination) return null;

        try {
            console.log("Calculando ruta de", origin, "a", destination);
            return await getRoute(
                [origin.latitude, origin.longitude],
                [destination.latitude, destination.longitude]
            );
        } catch (error) {
            console.error('Error calculando ruta:', error);
            return null;
        }
    };

    // Limpiar cualquier timeout pendiente al desmontar
    useEffect(() => {
        return () => {
            if (searchTimeout.current) {
                clearTimeout(searchTimeout.current);
                searchTimeout.current = null;
            }
        };
    }, []);

    return {
        // Estado
        recentLocations,
        searchResults,
        isSearching,
        searchQuery,
        error,

        // Acciones
        handleSearchChange,
        handleLocationSelect,
        getLocationFromCoordinates,
        calculateRoute,
        clearSearchResults,
        clearError
    };
}