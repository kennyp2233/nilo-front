// src/services/core/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Servicio para gestionar el almacenamiento local
 * Proporciona métodos tipados para guardar y recuperar datos
 */
export const storageService = {
    /**
     * Guarda un valor en el almacenamiento
     */
    async setItem<T>(key: string, value: T): Promise<void> {
        try {
            const jsonValue = JSON.stringify(value);
            await AsyncStorage.setItem(key, jsonValue);
        } catch (error) {
            console.error(`Error guardando ${key} en AsyncStorage:`, error);
            throw error;
        }
    },

    /**
     * Recupera un valor del almacenamiento
     */
    async getItem<T>(key: string, defaultValue?: T): Promise<T | null> {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            if (jsonValue === null) {
                return defaultValue ?? null;
            }
            try {
                return JSON.parse(jsonValue) as T;
            } catch (parseError) {
                // Si ocurre un error al parsear, es posible que el valor se haya almacenado como texto plano
                return jsonValue as unknown as T;
            }
        } catch (error) {
            console.error(`Error recuperando ${key} de AsyncStorage:`, error);
            return defaultValue ?? null;
        }
    },

    /**
     * Elimina un valor del almacenamiento
     */
    async removeItem(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error(`Error eliminando ${key} de AsyncStorage:`, error);
            throw error;
        }
    },

    /**
     * Limpia todo el almacenamiento
     */
    async clear(): Promise<void> {
        try {
            await AsyncStorage.clear();
        } catch (error) {
            console.error('Error limpiando AsyncStorage:', error);
            throw error;
        }
    },

    /**
     * Obtiene todas las claves almacenadas
     */
    async getAllKeys(): Promise<readonly string[]> {
        try {
            return await AsyncStorage.getAllKeys();
        } catch (error) {
            console.error('Error obteniendo claves de AsyncStorage:', error);
            return [];
        }
    },

    // Métodos para ubicaciones recientes
    recentLocations: {
        async add(location: any): Promise<void> {
            try {
                const recentLocations = await storageService.getItem<any[]>('recent_locations', []) || [];

                // Verificar si la ubicación ya existe
                const locationExists = recentLocations.some((loc: any) =>
                    loc.id === location.id ||
                    (loc.latitude === location.latitude && loc.longitude === location.longitude)
                );

                if (!locationExists) {
                    // Añadir al principio del array
                    recentLocations.unshift(location);

                    // Mantener solo las 10 ubicaciones más recientes
                    const trimmedLocations = recentLocations.slice(0, 10);

                    await storageService.setItem('recent_locations', trimmedLocations);
                }
            } catch (error) {
                console.error('Error guardando ubicación reciente:', error);
            }
        },

        async getAll(): Promise<any[]> {
            return await storageService.getItem<any[]>('recent_locations', []) || [];
        },

        async clear(): Promise<void> {
            await storageService.removeItem('recent_locations');
        }
    }
};
