
// En desarrollo, usa tu IP local en lugar de localhost
// Para Android emulator: 10.0.2.2
// Para dispositivo físico: tu IP local (ej: 192.168.1.X)
const API_URL = __DEV__
    ? 'http://10.0.2.2:3000'  // Para Android emulator
    // ? 'http://192.168.1.X:3000'  // Para dispositivo físico (reemplaza X con tu IP)
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
    }
};