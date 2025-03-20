// src/services/core/authService.ts
import { api } from '../api';
import { storageService } from './storageService';
import { RegisterUserData, LoginCredentials } from '../api/endpoints/authEndpoints';

/**
 * Servicio para gestionar la autenticación
 * Maneja login, registro, y estado de sesión
 */
export const authService = {
    /**
     * Inicializa el estado de autenticación desde el almacenamiento
     */
    async initialize(): Promise<{ user: any; token: string } | null> {
        try {
            const token = await storageService.getItem<string>('auth_token');

            if (token) {
                // Establecer token en el cliente API
                await api.client.setToken(token);

                // Obtener perfil de usuario
                const user = await api.auth.getProfile();
                return { user, token };
            }

            return null;
        } catch (error) {
            console.error('Error inicializando autenticación:', error);
            // Limpiar cualquier token potencialmente inválido
            await storageService.removeItem('auth_token');
            return null;
        }
    },

    /**
     * Inicia sesión con credenciales
     */
    async login(credentials: LoginCredentials): Promise<{ user: any; token: string }> {
        try {
            const response = await api.auth.login(credentials);
            return {
                user: response.user,
                token: response.token
            };
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    /**
     * Registra un nuevo usuario
     */
    async register(userData: RegisterUserData): Promise<{ user: any; token: string }> {
        try {
            const response = await api.auth.register(userData);
            return {
                user: response.user,
                token: response.token
            };
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    /**
     * Cierra la sesión
     */
    async logout(): Promise<void> {
        try {
            await api.client.clearToken();
            await storageService.removeItem('auth_token');
        } catch (error) {
            console.error('Error en logout:', error);
            throw error;
        }
    },

    /**
     * Actualiza el perfil de usuario
     */
    async updateProfile(profileData: any): Promise<any> {
        try {
            return await api.users.updateUserProfile(profileData);
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            throw error;
        }
    },

    /**
     * Verifica si hay una sesión activa
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await storageService.getItem<string>('auth_token');
        return !!token;
    }
};