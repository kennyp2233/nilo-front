
// En desarrollo, usa tu IP local en lugar de localhost
// Para Android emulator: 10.0.2.2
// Para dispositivo físico: tu IP local (ej: 192.168.1.X)
const API_URL = __DEV__
    ? 'http://192.168.68.105:3000'  // Usa la IP local de tu backend
    : process.env.EXPO_PUBLIC_API_URL;

export const LocationService = {
    async searchLocations(query: string): Promise<any[]> {
        try {
            console.log('Searching locations with query:', query);
            console.log('API URL:', API_URL);

            const response = await fetch(
                `${API_URL}/geocoding/search?query=${encodeURIComponent(query)}`
            );

            if (!response.ok) {
                console.error('Error searching locations:', response);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Search results:', data);
            return data;
        } catch (error) {
            console.error('Error searching locations:', error);
            throw error; // Re-lanzar el error para manejarlo en el componente
        }
    },

    async reverseGeocode(latitude: number, longitude: number): Promise<any | null> {
        try {
            const response = await fetch(
                `${API_URL}/geocoding/reverse?latitude=${latitude}&longitude=${longitude}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error reverse geocoding:', error);
            throw error;
        }
    },

    async saveRecentLocation(location: any): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/locations/recent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(location),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving recent location:', error);
            throw error;
        }
    },

    async getRoute(start: [number, number], end: [number, number]): Promise<any> {
        try {
            console.log('Fetching route from:', start, 'to:', end);

            const response = await fetch(
                `${API_URL}/ors/route?start=${start.join(',')}&end=${end.join(',')}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Route data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching route:', error);
            throw error;
        }
    }
};