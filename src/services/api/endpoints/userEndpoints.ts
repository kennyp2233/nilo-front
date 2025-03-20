// src/services/api/endpoints/userEndpoints.ts
import { apiClient } from '../apiClient';

/**
 * Interfaces para usuarios y vehículos
 */
export interface UserProfile {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profilePicture?: string;
    role: 'PASSENGER' | 'DRIVER' | 'ADMIN';
    // Información adicional específica del rol
    passenger?: any;
    driver?: any;
    createdAt: string;
    updatedAt: string;
}

export interface VehicleData {
    id?: string;
    make: string;
    model: string;
    year: number;
    color: string;
    plate: string;
    capacity: number;
    type: 'STANDARD' | 'COMFORT' | 'VAN' | 'MOTORCYCLE';
    features?: string[];
    documents?: any[];
}

/**
 * Servicio de endpoints para usuarios
 */
export const userEndpoints = {
    /**
     * Obtiene el perfil del usuario actual
     */
    getUserProfile: async (): Promise<UserProfile> => {
        return apiClient.get<UserProfile>('/users/profile');
    },

    /**
     * Actualiza el perfil del usuario
     */
    updateUserProfile: async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
        return apiClient.patch<UserProfile>('/users/profile', profileData);
    },

    /**
     * Actualiza la foto de perfil
     */
    updateProfilePicture: async (formData: FormData): Promise<UserProfile> => {
        return apiClient.request<UserProfile>({
            method: 'POST',
            url: '/users/profile/picture',
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    /**
     * Registra token de notificaciones
     */
    registerNotificationToken: async (token: string, deviceInfo: string): Promise<any> => {
        return apiClient.post<any>('/notifications/token', { token, deviceInfo });
    },

    /**
     * Desactiva token de notificaciones
     */
    deactivateNotificationToken: async (token: string): Promise<any> => {
        return apiClient.delete<any>(`/notifications/token/${token}`);
    },

    /**
     * Obtiene historial de calificaciones
     */
    getRatings: async (): Promise<any[]> => {
        return apiClient.get<any[]>('/users/ratings');
    }
};

/**
 * Servicio de endpoints para vehículos (para conductores)
 */
export const vehicleEndpoints = {
    /**
     * Registra un nuevo vehículo
     */
    registerVehicle: async (vehicleData: VehicleData): Promise<VehicleData> => {
        return apiClient.post<VehicleData>('/vehicles', vehicleData);
    },

    /**
     * Obtiene información de un vehículo
     */
    getVehicle: async (vehicleId: string): Promise<VehicleData> => {
        return apiClient.get<VehicleData>(`/vehicles/${vehicleId}`);
    },

    /**
     * Obtiene todos los vehículos del conductor actual
     */
    getAllVehicles: async (): Promise<VehicleData[]> => {
        return apiClient.get<VehicleData[]>('/vehicles');
    },

    /**
     * Actualiza información de un vehículo
     */
    updateVehicle: async (vehicleId: string, vehicleData: Partial<VehicleData>): Promise<VehicleData> => {
        return apiClient.patch<VehicleData>(`/vehicles/${vehicleId}`, vehicleData);
    },

    /**
     * Elimina un vehículo
     */
    deleteVehicle: async (vehicleId: string): Promise<void> => {
        return apiClient.delete<void>(`/vehicles/${vehicleId}`);
    },

    /**
     * Sube documento de vehículo (seguro, matrícula, etc.)
     */
    uploadVehicleDocument: async (
        vehicleId: string,
        documentType: string,
        formData: FormData
    ): Promise<any> => {
        return apiClient.request<any>({
            method: 'POST',
            url: `/vehicles/${vehicleId}/documents/${documentType}`,
            data: formData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    }
};