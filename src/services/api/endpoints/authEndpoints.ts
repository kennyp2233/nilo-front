// src/services/api/endpoints/authEndpoints.ts
import { apiClient } from '../apiClient';

/**
 * Interfaces para los datos de autenticación
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterUserData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
}

export interface AuthResponse {
    token: string;
    user: any; // Podemos tiparlo mejor después
}

/**
 * Servicio de endpoints para autenticación
 */
export const authEndpoints = {
    /**
     * Registra un nuevo usuario
     */
    register: async (userData: RegisterUserData): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/register', userData);

        if (response.token) {
            await apiClient.setToken(response.token);
        }

        return response;
    },

    /**
     * Inicia sesión con credenciales
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await apiClient.post<AuthResponse>('/auth/login', credentials);

        if (response.token) {
            await apiClient.setToken(response.token);
        }

        return response;
    },

    /**
     * Obtiene el perfil del usuario actual
     */
    getProfile: async (): Promise<any> => {
        return apiClient.get<any>('/auth/profile');
    },

    /**
     * Cierra la sesión actual
     */
    logout: async (): Promise<void> => {
        await apiClient.clearToken();
    },

    /**
     * Solicita restablecimiento de contraseña
     */
    forgotPassword: async (email: string): Promise<any> => {
        return apiClient.post<any>('/auth/forgot-password', { email });
    },

    /**
     * Restablece contraseña con token
     */
    resetPassword: async (token: string, newPassword: string): Promise<any> => {
        return apiClient.post<any>('/auth/reset-password', { token, password: newPassword });
    }
};