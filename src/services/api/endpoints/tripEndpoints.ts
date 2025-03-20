// src/services/api/endpoints/tripEndpoints.ts
import { apiClient } from '../apiClient';

/**
 * Interfaces para datos de viajes
 */
export interface Location {
    id?: string;
    latitude: number;
    longitude: number;
    name?: string;
    displayName?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
    };
}

export interface TripRequest {
    type: 'ON_DEMAND' | 'INTERCITY';
    startLocation: Location;
    endLocation: Location;
    scheduledAt?: string;
    availableSeats?: number;
    pricePerSeat?: number;
}

export interface Trip {
    id: string;
    type: 'ON_DEMAND' | 'INTERCITY';
    status: 'SEARCHING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'SCHEDULED';
    startLocation: Location;
    endLocation: Location;
    passengerId: string;
    driverId?: string;
    vehicleId?: string;
    scheduledAt?: string;
    startedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancellationReason?: string;
    distance?: number;
    duration?: number;
    price?: number;
    availableSeats?: number;
    pricePerSeat?: number;
    driver?: any;
    vehicle?: any;
    passenger?: any;
    payment?: any;
    trip: {
        id: string;
        origin: string;
        destination: string;
    }
    tripId: string;
}

export interface StatusChangeData {
    status: string;
    cancellationReason?: string;
}

export interface RatingData {
    toUserId: string;
    score: number;
    comment?: string;
}

/**
 * Servicio de endpoints para viajes
 */
export const tripEndpoints = {
    /**
     * Crea un nuevo viaje
     */
    createTrip: async (tripData: TripRequest): Promise<Trip> => {
        return apiClient.post<Trip>('/trips', tripData);
    },

    /**
     * Obtiene todos los viajes o filtrados por estado
     */
    getTrips: async (status?: string): Promise<Trip[]> => {
        return apiClient.get<Trip[]>('/trips', status ? { status } : undefined);
    },

    /**
     * Obtiene detalles de un viaje específico
     */
    getTripDetails: async (tripId: string): Promise<Trip> => {
        return apiClient.get<Trip>(`/trips/${tripId}`);
    },

    /**
     * Actualiza el estado de un viaje
     */
    updateTripStatus: async (tripId: string, statusData: StatusChangeData): Promise<Trip> => {
        return apiClient.patch<Trip>(`/trips/${tripId}`, statusData);
    },

    /**
     * Acepta un viaje (para conductores)
     */
    acceptTrip: async (tripId: string): Promise<Trip> => {
        return apiClient.post<Trip>(`/trips/${tripId}/accept`);
    },

    /**
     * Califica un viaje
     */
    rateTrip: async (tripId: string, ratingData: RatingData): Promise<any> => {
        return apiClient.post<any>(`/trips/${tripId}/rate`, ratingData);
    },

    /**
     * Cancela un viaje en curso
     */
    cancelTrip: async (tripId: string, reason: string): Promise<Trip> => {
        return apiClient.patch<Trip>(`/trips/${tripId}`, {
            status: 'CANCELLED',
            cancellationReason: reason
        });
    },

    /**
     * Actualiza la ubicación del conductor durante un viaje
     */
    updateDriverLocation: async (tripId: string, location: Location): Promise<any> => {
        return apiClient.post<any>(`/trips/${tripId}/location`, { location });
    }
};