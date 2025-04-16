// src/stores/authStore.ts
import { create } from 'zustand';
import { authService } from '@/src/services';
import { LoginCredentials, RegisterUserData } from '@/src/services';
import { websocketService } from '../services/core/websocketService';

interface AuthState {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;

    initialize: () => Promise<void>;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    register: (userData: RegisterUserData) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (profileData: any) => Promise<any>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    isLoading: true,
    error: null,

    // Inicializar el estado de autenticación desde el almacenamiento
    initialize: async () => {
        try {
            const auth = await authService.initialize();

            if (auth) {
                set({
                    user: auth.user,
                    token: auth.token,
                    isLoading: false
                });

                // Inicializar WebSocket si tenemos token
                if (auth.token) {
                    websocketService.initialize(auth.token);
                }
            } else {
                set({ user: null, token: null, isLoading: false });
            }
        } catch (error: any) {
            console.error('Error inicializando autenticación:', error);
            set({
                user: null,
                token: null,
                isLoading: false,
                error: error?.message || 'Error al inicializar la autenticación'
            });
        }
    },

    // Iniciar sesión con credenciales
    login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
            const { user, token } = await authService.login(credentials);
            set({ user, token, isLoading: false });

            // Inicializar WebSocket al iniciar sesión
            websocketService.initialize(token);

            return true;
        } catch (error: any) {
            console.error('Error en login:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al iniciar sesión'
            });
            return false;
        }
    },

    // Registrar un nuevo usuario
    register: async (userData: RegisterUserData) => {
        set({ isLoading: true, error: null });
        try {
            const { user, token } = await authService.register(userData);
            set({ user, token, isLoading: false });

            // Inicializar WebSocket al registrarse
            websocketService.initialize(token);

            return true;
        } catch (error: any) {
            console.error('Error en registro:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al registrarse'
            });
            return false;
        }
    },

    // Cerrar sesión
    logout: async () => {
        set({ isLoading: true });
        try {
            await authService.logout();

            // Desconectar WebSocket al cerrar sesión
            websocketService.disconnect();

            set({ user: null, token: null, isLoading: false });
        } catch (error: any) {
            console.error('Error en logout:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al cerrar sesión'
            });
        }
    },

    // Actualizar perfil de usuario
    updateProfile: async (profileData: any) => {
        set({ isLoading: true, error: null });
        try {
            const updatedUser = await authService.updateProfile(profileData);
            set({ user: updatedUser, isLoading: false });
            return updatedUser;
        } catch (error: any) {
            console.error('Error actualizando perfil:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al actualizar perfil'
            });
            throw error;
        }
    },

    // Limpiar errores
    clearError: () => set({ error: null })
}));