// src/stores/authStore.ts (Actualizado)
import { create } from 'zustand';
import { authService } from '@/src/services';
import { RegisterUserData, LoginCredentials } from '@/src/services';

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
    // Propiedades adicionales basadas en el rol
    passenger?: any;
    driver?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    // Acciones
    initialize: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterUserData) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (profileData: any) => Promise<boolean>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: false,
    error: null,

    // Inicializar estado de autenticación desde almacenamiento
    initialize: async () => {
        set({ isLoading: true });
        try {
            const authData = await authService.initialize();

            if (authData) {
                set({
                    user: authData.user,
                    token: authData.token,
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error: any) {
            console.error('Error inicializando auth:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al inicializar'
            });
        }
    },

    // Login
    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login({ email, password });
            set({
                user: response.user,
                token: response.token,
                isLoading: false
            });
            return true;
        } catch (error: any) {
            console.error('Error de login:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al iniciar sesión'
            });
            return false;
        }
    },

    // Registro
    register: async (userData: RegisterUserData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.register(userData);
            set({
                user: response.user,
                token: response.token,
                isLoading: false
            });
            return true;
        } catch (error: any) {
            console.error('Error de registro:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al registrarse'
            });
            return false;
        }
    },

    // Logout
    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();
            set({
                user: null,
                token: null,
                isLoading: false
            });
        } catch (error: any) {
            console.error('Error de logout:', error);
            set({
                isLoading: false,
                error: error.message || 'Error al cerrar sesión'
            });
        }
    },

    // Actualizar perfil
    updateProfile: async (profileData: any) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await authService.updateProfile(profileData);
            set({
                user: { ...get().user, ...updatedUser },
                isLoading: false
            });
            return true;
        } catch (error: any) {
            console.error('Error al actualizar perfil:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al actualizar perfil'
            });
            return false;
        }
    },

    // Limpiar error
    clearError: () => set({ error: null })
}));