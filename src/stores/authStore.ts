// stores/authStore.ts
import { create } from 'zustand';
import { apiService } from '@/src/services/api.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
    // Additional properties based on role
    passenger?: any;
    driver?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: any) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (profileData: any) => Promise<boolean>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    // Initialize auth state from storage
    initialize: async () => {
        set({ isLoading: true });
        try {
            const token = await AsyncStorage.getItem('auth_token');

            if (token) {
                // Set token in API service
                await apiService.setToken(token);

                // Get user profile
                const user = await apiService.getProfile();
                set({ user, token, isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error: any) {
            console.error('Failed to initialize auth:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to initialize'
            });

            // Clear any potentially invalid token
            await AsyncStorage.removeItem('auth_token');
        }
    },

    // Login
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.login({ email, password });
            set({
                user: response.user,
                token: response.token,
                isLoading: false
            });
            return true;
        } catch (error: any) {
            console.error('Login failed:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Login failed'
            });
            return false;
        }
    },

    // Register
    register: async (userData: any) => {
        set({ isLoading: true, error: null });
        try {
            const response = await apiService.register(userData);
            set({
                user: response.user,
                token: response.token,
                isLoading: false
            });
            return true;
        } catch (error: any) {
            console.error('Registration failed:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Registration failed'
            });
            return false;
        }
    },

    // Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            await apiService.clearToken();
            await AsyncStorage.removeItem('auth_token');
            set({
                user: null,
                token: null,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Logout failed:', error);
            set({
                isLoading: false,
                error: error.message || 'Logout failed'
            });
        }
    },

    // Update profile
    updateProfile: async (profileData: any) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await apiService.updateUserProfile(profileData);
            set({
                user: { ...get().user, ...updatedUser },
                isLoading: false
            });
            return true;
        } catch (error: any) {
            console.error('Profile update failed:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Profile update failed'
            });
            return false;
        }
    },

    // Clear error
    clearError: () => set({ error: null })
}));