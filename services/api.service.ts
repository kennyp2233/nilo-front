// services/api.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Base URL - Use environment variable or default to localhost
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class ApiService {
    private api: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add request interceptor to attach auth token
        this.api.interceptors.request.use(
            async (config) => {
                // If token is already loaded, use it
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                    return config;
                }

                // Try to get token from storage
                try {
                    const token = await AsyncStorage.getItem('auth_token');
                    if (token) {
                        this.token = token;
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error('Error getting token from storage:', error);
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor to handle common errors
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Handle 401 errors (unauthorized)
                if (error.response && error.response.status === 401) {
                    // Clear token and redirect to login
                    await this.clearToken();
                    // You could also trigger navigation to login screen here
                }
                return Promise.reject(error);
            }
        );
    }

    // Set token after login/registration
    public async setToken(token: string): Promise<void> {
        this.token = token;
        await AsyncStorage.setItem('auth_token', token);
    }

    // Clear token on logout
    public async clearToken(): Promise<void> {
        this.token = null;
        await AsyncStorage.removeItem('auth_token');
    }

    // Generic request method
    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api(config);
            return response.data;
        } catch (error: any) {
            // Handle error and provide meaningful message
            const message = error.response?.data?.message || error.message || 'Something went wrong';
            console.error(`API Error (${config.method} ${config.url}):`, message);
            throw error;
        }
    }

    // Auth endpoints
    public async register(userData: any): Promise<any> {
        const response = await this.request<any>({
            method: 'POST',
            url: '/auth/register',
            data: userData,
        });

        if (response.token) {
            await this.setToken(response.token);
        }

        return response;
    }

    public async login(credentials: { email: string; password: string }): Promise<any> {
        const response = await this.request<any>({
            method: 'POST',
            url: '/auth/login',
            data: credentials,
        });

        if (response.token) {
            await this.setToken(response.token);
        }

        return response;
    }

    public async getProfile(): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: '/auth/profile',
        });
    }

    // User endpoints
    public async getUserProfile(): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: '/users/profile',
        });
    }

    public async updateUserProfile(profileData: any): Promise<any> {
        return this.request<any>({
            method: 'PATCH',
            url: '/users/profile',
            data: profileData,
        });
    }

    // Wallet endpoints
    public async getWallet(): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: '/users/wallet',
        });
    }

    // Geocoding endpoints
    public async searchLocations(query: string, limit = 5, countryCode = 'EC'): Promise<any[]> {
        return this.request<any[]>({
            method: 'GET',
            url: '/geocoding/search',
            params: { query, limit, countryCode },
        });
    }

    public async reverseGeocode(latitude: number, longitude: number): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: '/geocoding/reverse',
            params: { latitude, longitude },
        });
    }

    // Route endpoints (ORS)
    public async getRoute(start: [number, number], end: [number, number]): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: '/ors/route',
            params: {
                start: start.join(','),
                end: end.join(','),
            },
        });
    }

    // Trip endpoints
    public async createTrip(tripData: any): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/trips',
            data: tripData,
        });
    }

    public async getTrips(status?: string): Promise<any[]> {
        return this.request<any[]>({
            method: 'GET',
            url: '/trips',
            params: status ? { status } : undefined,
        });
    }

    public async getTripDetails(tripId: string): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: `/trips/${tripId}`,
        });
    }

    public async updateTripStatus(tripId: string, statusData: any): Promise<any> {
        return this.request<any>({
            method: 'PATCH',
            url: `/trips/${tripId}`,
            data: statusData,
        });
    }

    public async acceptTrip(tripId: string): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: `/trips/${tripId}/accept`,
        });
    }

    public async rateTrip(tripId: string, ratingData: any): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: `/trips/${tripId}/rate`,
            data: ratingData,
        });
    }

    // Vehicle endpoints (for drivers)
    public async registerVehicle(vehicleData: any): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/vehicles',
            data: vehicleData,
        });
    }

    public async getVehicle(vehicleId: string): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: `/vehicles/${vehicleId}`,
        });
    }

    public async updateVehicle(vehicleId: string, vehicleData: any): Promise<any> {
        return this.request<any>({
            method: 'PATCH',
            url: `/vehicles/${vehicleId}`,
            data: vehicleData,
        });
    }

    // Payment endpoints
    public async createPayment(paymentData: any): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/payments',
            data: paymentData,
        });
    }

    public async getPaymentHistory(): Promise<any[]> {
        return this.request<any[]>({
            method: 'GET',
            url: '/payments/user/history',
        });
    }

    // Wallet endpoints
    public async getWalletBalance(): Promise<any> {
        return this.request<any>({
            method: 'GET',
            url: '/wallets',
        });
    }

    public async getWalletTransactions(limit?: number): Promise<any[]> {
        return this.request<any[]>({
            method: 'GET',
            url: '/wallets/transactions',
            params: limit ? { limit } : undefined,
        });
    }

    public async depositToWallet(amount: number, description: string): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/wallets/deposit',
            data: { amount, description },
        });
    }

    public async withdrawFromWallet(amount: number, description: string): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/wallets/withdraw',
            data: { amount, description },
        });
    }

    // Notification endpoints
    public async registerNotificationToken(token: string, deviceInfo: string): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/notifications/token',
            data: { token, deviceInfo },
        });
    }

    public async deactivateNotificationToken(token: string): Promise<any> {
        return this.request<any>({
            method: 'DELETE',
            url: `/notifications/token/${token}`,
        });
    }

    // Promotion endpoints
    public async applyPromoCode(code: string, amount: number, tripType: string): Promise<any> {
        return this.request<any>({
            method: 'POST',
            url: '/promotions/apply',
            data: { code, amount, tripType },
        });
    }
}

// Export as singleton
export const apiService = new ApiService();