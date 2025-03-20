// src/services/api/apiClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - Utiliza variable de entorno o valor por defecto
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

/**
 * Cliente API base que maneja la configuración de Axios,
 * interceptores para tokens, y manejo de errores comunes
 */
class ApiClient {
    private api: AxiosInstance;
    private token: string | null = null;

    constructor() {
        this.api = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000
        });

        // Configurar interceptores
        this.setupInterceptors();
    }

    /**
     * Configura los interceptores de request y response
     */
    private setupInterceptors(): void {
        // Interceptor para adjuntar token de autenticación
        this.api.interceptors.request.use(
            async (config) => {
                // Si ya tenemos el token, lo usamos
                if (this.token) {
                    config.headers.Authorization = `Bearer ${this.token}`;
                    return config;
                }

                // Intentamos obtener el token del almacenamiento
                try {
                    const token = await AsyncStorage.getItem('auth_token');
                    if (token) {
                        this.token = token;
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                } catch (error) {
                    console.error('Error al obtener token del almacenamiento:', error);
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        // Interceptor para manejar errores comunes de respuesta
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                // Manejar errores 401 (no autorizado)
                if (error.response && error.response.status === 401) {
                    // Limpiamos el token
                    await this.clearToken();
                    // Aquí podríamos disparar alguna acción para redirigir al login
                }
                return Promise.reject(error);
            }
        );
    }

    /**
     * Establece el token después de login/registro
     */
    public async setToken(token: string): Promise<void> {
        this.token = token;
        await AsyncStorage.setItem('auth_token', token);
    }

    /**
     * Limpia el token en el logout
     */
    public async clearToken(): Promise<void> {
        this.token = null;
        await AsyncStorage.removeItem('auth_token');
    }

    /**
     * Método genérico para realizar peticiones HTTP
     */
    public async request<T>(config: AxiosRequestConfig): Promise<T> {
        try {
            const response: AxiosResponse<T> = await this.api(config);
            console.log(`API Response (${config.method} ${config.url}):`, response.data);
            return response.data;
        } catch (error: any) {
            console.error(`❌ API Error (${config.method} ${config.url}):`, {
                message: error.message,
                status: error.response?.status || 'No response',
                data: error.response?.data || 'No response data',
                request: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: error.config?.headers,
                    params: error.config?.params,
                    data: error.config?.data
                },
                code: error.code,
                stack: error.stack
            });

            throw error;
        }
    }

    /**
     * Método de ayuda para peticiones GET
     */
    public async get<T>(url: string, params?: any): Promise<T> {
        return this.request<T>({
            method: 'GET',
            url,
            params
        });
    }

    /**
     * Método de ayuda para peticiones POST
     */
    public async post<T>(url: string, data?: any): Promise<T> {
        return this.request<T>({
            method: 'POST',
            url,
            data
        });
    }

    /**
     * Método de ayuda para peticiones PATCH
     */
    public async patch<T>(url: string, data?: any): Promise<T> {
        return this.request<T>({
            method: 'PATCH',
            url,
            data
        });
    }

    /**
     * Método de ayuda para peticiones DELETE
     */
    public async delete<T>(url: string): Promise<T> {
        return this.request<T>({
            method: 'DELETE',
            url
        });
    }
}

// Exportamos una instancia singleton
export const apiClient = new ApiClient();