// src/stores/tripStore.ts
import { create } from 'zustand';
import { tripService, locationService } from '@/src/services';
import { Location, Trip, TripRequest } from '@/src/services';

interface TripState {
    trips: Trip[];
    activeTrip: Trip | null;
    isLoading: boolean;
    error: string | null;
    route: any | null;
    realtimeUpdates: boolean;

    // Acciones
    fetchTrips: (status?: string) => Promise<void>;
    fetchTripDetails: (tripId: string) => Promise<Trip | null>;
    createTrip: (tripRequest: TripRequest) => Promise<Trip | null>;
    updateTripStatus: (tripId: string, status: string, reason?: string) => Promise<boolean>;
    acceptTrip: (tripId: string) => Promise<boolean>;
    rateTrip: (tripId: string, toUserId: string, score: number, comment?: string) => Promise<boolean>;
    fetchRoute: (startLocation: Location, endLocation: Location) => Promise<any>;
    clearError: () => void;
    setActiveTrip: (trip: Trip | null) => void;
    updateTripFromRealtime: (tripId: string, data: Partial<Trip>) => void;
    setRealtimeUpdates: (enabled: boolean) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
    trips: [],
    activeTrip: null,
    isLoading: false,
    error: null,
    route: null,
    realtimeUpdates: true, // Habilitado por defecto

    // Obtener todos los viajes o filtrados por estado
    fetchTrips: async (status?: string) => {
        set({ isLoading: true, error: null });
        try {
            const trips = await tripService.getTrips(status);
            set({ trips, isLoading: false });
        } catch (error: any) {
            console.error('Error obteniendo viajes:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al obtener viajes'
            });
        }
    },

    // Obtener detalles de un viaje específico
    fetchTripDetails: async (tripId: string) => {
        set({ isLoading: true, error: null });
        try {
            const trip = await tripService.getTripDetails(tripId);
            set({ activeTrip: trip, isLoading: false });
            return trip;
        } catch (error: any) {
            console.error(`Error obteniendo detalles del viaje ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al obtener detalles del viaje'
            });
            return null;
        }
    },

    // Crear un nuevo viaje
    createTrip: async (tripRequest: TripRequest) => {
        set({ isLoading: true, error: null });
        try {
            const trip = await tripService.createTrip(tripRequest);
            set({
                activeTrip: trip,
                trips: [trip, ...get().trips],
                isLoading: false
            });
            return trip;
        } catch (error: any) {
            console.error('Error creando viaje:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al crear viaje'
            });
            return null;
        }
    },

    // Actualizar estado del viaje
    updateTripStatus: async (tripId: string, status: string, reason?: string) => {
        set({ isLoading: true, error: null });
        try {
            const updatedTrip = await tripService.updateTripStatus(tripId, status, reason);

            // Actualizar viaje activo si es el mismo
            if (get().activeTrip?.id === tripId) {
                set({ activeTrip: updatedTrip });
            }

            // Actualizar en la lista de viajes
            const updatedTrips = get().trips.map(trip =>
                trip.id === tripId ? updatedTrip : trip
            );

            set({ trips: updatedTrips, isLoading: false });
            return true;
        } catch (error: any) {
            console.error(`Error actualizando estado del viaje ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al actualizar estado del viaje'
            });
            return false;
        }
    },

    // Aceptar un viaje (para conductores)
    acceptTrip: async (tripId: string) => {
        set({ isLoading: true, error: null });
        try {
            const acceptedTrip = await tripService.acceptTrip(tripId);

            // Actualizar viaje activo si es el mismo
            if (get().activeTrip?.id === tripId) {
                set({ activeTrip: acceptedTrip });
            }

            // Actualizar en la lista de viajes
            const updatedTrips = get().trips.map(trip =>
                trip.id === tripId ? acceptedTrip : trip
            );

            set({ trips: updatedTrips, isLoading: false });
            return true;
        } catch (error: any) {
            console.error(`Error aceptando viaje ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al aceptar viaje'
            });
            return false;
        }
    },

    // Calificar un viaje
    rateTrip: async (tripId: string, toUserId: string, score: number, comment?: string) => {
        set({ isLoading: true, error: null });
        try {
            await tripService.rateTrip(tripId, toUserId, score, comment);
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            console.error(`Error calificando viaje ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al calificar viaje'
            });
            return false;
        }
    },

    // Obtener ruta entre dos ubicaciones
    fetchRoute: async (startLocation: Location, endLocation: Location) => {
        set({ isLoading: true, error: null, route: null });
        try {
            const route = await locationService.getRoute(
                [startLocation.latitude, startLocation.longitude],
                [endLocation.latitude, endLocation.longitude]
            );
            set({ route, isLoading: false });
            return route;
        } catch (error: any) {
            console.error('Error obteniendo ruta:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Error al obtener ruta'
            });
            return null;
        }
    },

    // Actualizar un viaje con datos en tiempo real (WebSockets)
    updateTripFromRealtime: (tripId: string, data: Partial<Trip>) => {
        const { realtimeUpdates } = get();

        // Si las actualizaciones en tiempo real están deshabilitadas, no hacer nada
        if (!realtimeUpdates) return;

        // Actualizar viaje activo si es el mismo
        if (get().activeTrip?.id === tripId) {
            set({
                activeTrip: {
                    ...get().activeTrip,
                    ...data
                } as Trip
            });
        }

        // Actualizar en la lista de viajes
        const updatedTrips = get().trips.map(trip =>
            trip.id === tripId ? { ...trip, ...data } : trip
        );

        set({ trips: updatedTrips });
    },

    // Activar/desactivar actualizaciones en tiempo real
    setRealtimeUpdates: (enabled: boolean) => {
        set({ realtimeUpdates: enabled });
    },

    // Limpiar error
    clearError: () => set({ error: null }),

    // Establecer viaje activo
    setActiveTrip: (trip: Trip | null) => set({ activeTrip: trip })
}));

// Re-exportamos los tipos para que estén disponibles al importar desde el store
export type { Location, Trip, TripRequest };