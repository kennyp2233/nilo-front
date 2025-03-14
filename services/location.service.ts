// services/location.service.ts
import { apiService } from './api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class LocationService {
    // Search for locations by query string
    static async searchLocations(query: string, limit = 5, countryCode = 'EC'): Promise<any[]> {
        try {
            console.log('Searching locations with query:', query);
            return await apiService.searchLocations(query, limit, countryCode);
        } catch (error) {
            console.error('Error searching locations:', error);
            return [];
        }
    }

    // Reverse geocode coordinates to address
    static async reverseGeocode(latitude: number, longitude: number): Promise<any | null> {
        try {
            return await apiService.reverseGeocode(latitude, longitude);
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            return null;
        }
    }

    // Save a location to recent locations
    static async saveRecentLocation(location: any): Promise<void> {
        try {
            // First, save to local storage
            const recentLocationsJSON = await AsyncStorage.getItem('recent_locations');
            let recentLocations = recentLocationsJSON ? JSON.parse(recentLocationsJSON) : [];

            // Check if location already exists
            const locationExists = recentLocations.some((loc: any) => loc.id === location.id);

            if (!locationExists) {
                // Add to beginning of array
                recentLocations.unshift(location);

                // Keep only the most recent 10 locations
                if (recentLocations.length > 10) {
                    recentLocations = recentLocations.slice(0, 10);
                }

                // Save back to storage
                await AsyncStorage.setItem('recent_locations', JSON.stringify(recentLocations));
            }

            // If user is logged in, also save to backend
            const token = await AsyncStorage.getItem('auth_token');
            if (token) {
                // Here we could implement a backend call to save to user's favorite locations
                // For now, just log the intent
                console.log('Would save to backend if endpoint was available:', location);
            }
        } catch (error) {
            console.error('Error saving recent location:', error);
        }
    }

    // Get recent locations
    static async getRecentLocations(): Promise<any[]> {
        try {
            const recentLocationsJSON = await AsyncStorage.getItem('recent_locations');
            return recentLocationsJSON ? JSON.parse(recentLocationsJSON) : [];
        } catch (error) {
            console.error('Error getting recent locations:', error);
            return [];
        }
    }

    // Get route between two points
    static async getRoute(startCoords: [number, number], endCoords: [number, number]): Promise<any> {
        try {
            console.log('Fetching route from:', startCoords, 'to:', endCoords);
            return await apiService.getRoute(startCoords, endCoords);
        } catch (error) {
            console.error('Error fetching route:', error);
            throw error;
        }
    }
}