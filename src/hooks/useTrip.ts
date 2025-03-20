// src/hooks/useTrip.ts (Refactorizado)
import { useCallback, useEffect, useState, useRef } from 'react';
import { useTripStore, Location, TripRequest, Trip } from '@/src/stores/tripStore';
import { tripService } from '../services/core/tripService';
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';

/**
 * Hook para gestionar viajes
 * @param tripId ID opcional del viaje actual
 */
export function useTrip(tripId?: string) {
    const { isAuthenticated } = useAuth(true); // Requiere autenticación
    const {
        trips,
        activeTrip,
        isLoading,
        error,
        route,
        fetchTrips,
        fetchTripDetails,
        createTrip,
        updateTripStatus,
        acceptTrip,
        rateTrip,
        fetchRoute,
        clearError,
        setActiveTrip
    } = useTripStore();
    const router = useRouter();
    const [routeError, setRouteError] = useState(false);

    // Estado local para el formulario
    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [tripType, setTripType] = useState<'ON_DEMAND' | 'INTERCITY'>('ON_DEMAND');
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [availableSeats, setAvailableSeats] = useState<number>(1);
    const [pricePerSeat, setPricePerSeat] = useState<number | null>(null);
    const routeRetryCount = useRef(0);
    const MAX_ROUTE_RETRIES = 2;

    // Estado para mantener caché de viajes por estado
    const [tripsByStatus, setTripsByStatus] = useState<{
        [key: string]: Trip[];
    }>({});

    // Estado para rastrear si la sincronización inicial de viajes ha ocurrido
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    // Cargar viaje específico si se proporciona ID
    useEffect(() => {
        if (isAuthenticated && tripId) {
            fetchTripDetails(tripId);
        }
    }, [isAuthenticated, tripId]);

    // Obtener todos los viajes cuando se autentica
    useEffect(() => {
        if (isAuthenticated && !initialSyncDone) {
            fetchAllTrips();
        }
    }, [isAuthenticated, initialSyncDone]);

    // Obtener viajes para todos los estados
    const fetchAllTrips = async () => {
        if (!isAuthenticated) return;

        try {
            // Primero obtenemos todos los viajes
            await fetchTrips();
            setInitialSyncDone(true);
        } catch (error) {
            console.error('Error obteniendo todos los viajes:', error);
        }
    };

    // Obtener viajes filtrados por estado
    const getTripsByStatus = useCallback((status?: string | string[]) => {
        return tripService.getTripsByStatus(trips, status);
    }, [trips]);

    // Obtener viajes activos
    const getActiveTrips = useCallback(() => {
        return tripService.getActiveTrips(trips);
    }, [trips]);

    // Actualizar ruta cuando cambian origen y destino
    useEffect(() => {
        const calculateRouteWithRetry = async () => {
            if (origin && destination) {
                try {
                    setRouteError(false);
                    console.log(`Intentando obtener ruta (intento ${routeRetryCount.current + 1}/${MAX_ROUTE_RETRIES + 1})`);
                    await fetchRoute(origin, destination);
                    // Resetear contador de reintentos en caso de éxito
                    routeRetryCount.current = 0;
                } catch (error) {
                    console.error('Error obteniendo ruta:', error);

                    // Lógica de reintento con backoff exponencial
                    if (routeRetryCount.current < MAX_ROUTE_RETRIES) {
                        routeRetryCount.current++;
                        const backoffTime = 1000 * Math.pow(2, routeRetryCount.current - 1);
                        console.log(`Reintentando en ${backoffTime}ms...`);

                        setTimeout(() => {
                            calculateRouteWithRetry();
                        }, backoffTime);
                    } else {
                        console.log("Máximo de reintentos alcanzado, estableciendo error de ruta");
                        setRouteError(true);
                        // Resetear contador para el próximo intento
                        routeRetryCount.current = 0;
                    }
                }
            }
        };

        if (origin && destination) {
            calculateRouteWithRetry();
        }
    }, [origin, destination]);

    // Manejar creación de viaje
    const handleCreateTrip = useCallback(async () => {
        if (!origin || !destination) {
            return null;
        }

        const tripRequest: TripRequest = {
            type: tripType,
            startLocation: origin,
            endLocation: destination,
        };

        // Añadir campos adicionales para viajes interurbanos
        if (tripType === 'INTERCITY') {
            if (!scheduledAt || !pricePerSeat || availableSeats < 1) {
                return null;
            }

            tripRequest.scheduledAt = scheduledAt.toISOString();
            tripRequest.availableSeats = availableSeats;
            tripRequest.pricePerSeat = pricePerSeat;
        }

        const trip = await createTrip(tripRequest);
        if (trip) {
            router.push(`/trip/details?tripId=${trip.id}`);
        }
        return trip;
    }, [origin, destination, tripType, scheduledAt, availableSeats, pricePerSeat]);

    // Manejar actualización de estado del viaje
    const handleUpdateStatus = useCallback(async (
        tripId: string,
        status: string,
        reason?: string
    ) => {
        const success = await updateTripStatus(tripId, status, reason);
        return success;
    }, []);

    // Resetear formulario
    const resetForm = useCallback(() => {
        setOrigin(null);
        setDestination(null);
        setTripType('ON_DEMAND');
        setScheduledAt(null);
        setAvailableSeats(1);
        setPricePerSeat(null);
        setActiveTrip(null);
        setRouteError(false);
    }, []);

    // Refrescar todos los viajes
    const refreshAllTrips = useCallback(async () => {
        await fetchAllTrips();
    }, []);

    return {
        // Estado
        trips,
        activeTrip,
        isLoading,
        error,
        route,
        routeError,
        origin,
        destination,
        tripType,
        scheduledAt,
        availableSeats,
        pricePerSeat,

        // Métodos de filtrado de viajes
        getTripsByStatus,
        getActiveTrips,

        // Acciones
        setOrigin,
        setDestination,
        setTripType,
        setScheduledAt,
        setAvailableSeats,
        setPricePerSeat,
        createTrip: handleCreateTrip,
        updateTripStatus: handleUpdateStatus,
        acceptTrip,
        rateTrip,
        fetchTripDetails,
        fetchTrips: refreshAllTrips,
        resetForm,
        clearError
    };
}