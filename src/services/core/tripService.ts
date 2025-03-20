// src/services/core/tripService.ts
import { api } from '../api';
import { locationService } from './location.service';
import { Trip, TripRequest, Location } from '../api/endpoints/tripEndpoints';

/**
 * Servicio para gestionar viajes
 * Proporciona métodos para crear, buscar y gestionar viajes
 */
export const tripService = {
    /**
     * Crea un nuevo viaje
     */
    async createTrip(tripRequest: TripRequest): Promise<Trip> {
        try {
            return await api.trips.createTrip(tripRequest);
        } catch (error) {
            console.error('Error creando viaje:', error);
            throw error;
        }
    },

    /**
     * Obtiene todos los viajes o filtrados por estado
     */
    async getTrips(status?: string): Promise<Trip[]> {
        try {
            const trips = await api.trips.getTrips(status);
            console.log('Viajes obtenidos:', trips);
            return trips;
        } catch (error) {
            console.error('Error obteniendo viajes:', error);
            throw error;
        }
    },

    /**
     * Obtiene detalles de un viaje específico
     */
    async getTripDetails(tripId: string): Promise<Trip> {
        try {
            return await api.trips.getTripDetails(tripId);
        } catch (error) {
            console.error(`Error obteniendo detalles del viaje ${tripId}:`, error);
            throw error;
        }
    },

    /**
     * Actualiza el estado de un viaje
     */
    async updateTripStatus(tripId: string, status: string, reason?: string): Promise<Trip> {
        try {
            const statusData: any = { status };
            if (reason && status === 'CANCELLED') {
                statusData.cancellationReason = reason;
            }

            return await api.trips.updateTripStatus(tripId, statusData);
        } catch (error) {
            console.error(`Error actualizando estado del viaje ${tripId}:`, error);
            throw error;
        }
    },

    /**
     * Acepta un viaje (para conductores)
     */
    async acceptTrip(tripId: string): Promise<Trip> {
        try {
            return await api.trips.acceptTrip(tripId);
        } catch (error) {
            console.error(`Error aceptando viaje ${tripId}:`, error);
            throw error;
        }
    },

    /**
     * Califica un viaje
     */
    async rateTrip(tripId: string, toUserId: string, score: number, comment?: string): Promise<any> {
        try {
            return await api.trips.rateTrip(tripId, {
                toUserId,
                score,
                comment
            });
        } catch (error) {
            console.error(`Error calificando viaje ${tripId}:`, error);
            throw error;
        }
    },

    /**
     * Cancela un viaje
     */
    async cancelTrip(tripId: string, reason: string): Promise<Trip> {
        try {
            return await this.updateTripStatus(tripId, 'CANCELLED', reason);
        } catch (error) {
            console.error(`Error cancelando viaje ${tripId}:`, error);
            throw error;
        }
    },

    /**
     * Calcula ruta entre dos ubicaciones
     */
    async calculateRoute(origin: Location, destination: Location): Promise<any> {
        try {
            return await locationService.getRoute(
                [origin.latitude, origin.longitude],
                [destination.latitude, destination.longitude]
            );
        } catch (error) {
            console.error('Error calculando ruta:', error);
            throw error;
        }
    },

    /**
     * Calcula el precio estimado de un viaje
     */
    async estimatePrice(origin: Location, destination: Location): Promise<number> {
        try {
            // En una implementación real, llamaríamos a un endpoint para obtener esto
            // Por ahora, simulamos un cálculo simple

            const route = await this.calculateRoute(origin, destination);

            // Si tenemos datos de distancia del servidor
            if (route && route.features && route.features[0] && route.features[0].properties) {
                const distanceInKm = route.features[0].properties.summary.distance / 1000;
                // Simulamos un cálculo de precio: tarifa base + precio por km
                const basePrice = 1.5;
                const pricePerKm = 0.5;
                return basePrice + (distanceInKm * pricePerKm);
            }

            // Cálculo aproximado si no tenemos ruta detallada
            const lat1 = origin.latitude;
            const lon1 = origin.longitude;
            const lat2 = destination.latitude;
            const lon2 = destination.longitude;

            // Cálculo de distancia aproximada usando la fórmula de Haversine
            const R = 6371; // Radio de la Tierra en km
            const dLat = this.deg2rad(lat2 - lat1);
            const dLon = this.deg2rad(lon2 - lon1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c; // Distancia en km

            // Tarifa base + precio por km
            const basePrice = 1.5;
            const pricePerKm = 0.5;
            return basePrice + (distance * pricePerKm);
        } catch (error) {
            console.error('Error estimando precio:', error);
            // Valor por defecto si hay error
            return 5.00;
        }
    },

    /**
     * Convierte grados a radianes (para cálculo de distancia)
     */
    deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    },

    /**
     * Obtiene viajes activos (no completados ni cancelados)
     */
    getActiveTrips(trips: Trip[]): Trip[] {
        return trips.filter(trip =>
            !['COMPLETED', 'CANCELLED'].includes(trip.status)
        );
    },

    /**
     * Filtra trips por estado
     */
    getTripsByStatus(trips: Trip[], status?: string | string[]): Trip[] {
        if (!status) return trips;

        if (Array.isArray(status)) {
            return trips.filter(trip => status.includes(trip.status));
        }

        return trips.filter(trip => trip.status === status);
    }
};