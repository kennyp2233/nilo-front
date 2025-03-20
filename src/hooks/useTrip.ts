// src/hooks/useTrip.ts (Actualizado)
import { useCallback, useEffect, useState, useRef } from 'react';
import { useTripStore, Location, TripRequest, Trip } from '@/src/stores/tripStore';
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';

export function useTrip(tripId?: string) {
    const { isAuthenticated } = useAuth(true); // Require authentication
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

    // Local state for form handling
    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [tripType, setTripType] = useState<'ON_DEMAND' | 'INTERCITY'>('ON_DEMAND');
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [availableSeats, setAvailableSeats] = useState<number>(1);
    const [pricePerSeat, setPricePerSeat] = useState<number | null>(null);
    const routeRetryCount = useRef(0);
    const MAX_ROUTE_RETRIES = 2;

    // Estado para mantener un caché de viajes por estado
    const [tripsByStatus, setTripsByStatus] = useState<{
        [key: string]: Trip[];
    }>({});

    // Estado para rastrear si la sincronización inicial de viajes ha ocurrido
    const [initialSyncDone, setInitialSyncDone] = useState(false);

    // Load specific trip if ID provided
    useEffect(() => {
        if (isAuthenticated && tripId) {
            fetchTripDetails(tripId);
        }
    }, [isAuthenticated, tripId]);

    // Fetch all trips when authenticated
    useEffect(() => {
        if (isAuthenticated && !initialSyncDone) {
            fetchAllTrips();
        }
    }, [isAuthenticated, initialSyncDone]);

    // Fetch trips for all statuses
    const fetchAllTrips = async () => {
        if (!isAuthenticated) return;

        try {
            // Primero obtenemos todos los viajes
            await fetchTrips();
            setInitialSyncDone(true);

            // Luego podemos obtener viajes específicos por estado si es necesario
            // Esto dependería de la API y los requisitos específicos
        } catch (error) {
            console.error('Error fetching all trips:', error);
        }
    };

    // Get trips filtered by status
    const getTripsByStatus = useCallback((status?: string | string[]) => {
        if (!status) return trips;

        if (Array.isArray(status)) {
            return trips.filter(trip => status.includes(trip.status));
        }

        return trips.filter(trip => trip.status === status);
    }, [trips]);

    // Get active trips (any trip that's not completed or cancelled)
    const getActiveTrips = useCallback(() => {
        return trips.filter(trip =>
            !['COMPLETED', 'CANCELLED'].includes(trip.status)
        );
    }, [trips]);

    // Update route when origin and destination change
    useEffect(() => {
        const calculateRouteWithRetry = async () => {
            if (origin && destination) {
                try {
                    setRouteError(false);
                    console.log(`Attempting to fetch route (attempt ${routeRetryCount.current + 1}/${MAX_ROUTE_RETRIES + 1})`);
                    await fetchRoute(origin, destination);
                    // Reset retry counter on success
                    routeRetryCount.current = 0;
                } catch (error) {
                    console.error('Error fetching route:', error);

                    // Retry logic with exponential backoff
                    if (routeRetryCount.current < MAX_ROUTE_RETRIES) {
                        routeRetryCount.current++;
                        const backoffTime = 1000 * Math.pow(2, routeRetryCount.current - 1);
                        console.log(`Retrying in ${backoffTime}ms...`);

                        setTimeout(() => {
                            calculateRouteWithRetry();
                        }, backoffTime);
                    } else {
                        console.log("Max retries reached, setting route error");
                        setRouteError(true);
                        // Reset retry counter for next attempt
                        routeRetryCount.current = 0;
                    }
                }
            }
        };

        if (origin && destination) {
            calculateRouteWithRetry();
        }
    }, [origin, destination]);

    // Handle trip creation
    const handleCreateTrip = useCallback(async () => {
        if (!origin || !destination) {
            return null;
        }

        const tripRequest: TripRequest = {
            type: tripType,
            startLocation: origin,
            endLocation: destination,
        };

        // Add additional fields for intercity trips
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

    // Handle trip status update
    const handleUpdateStatus = useCallback(async (
        tripId: string,
        status: string,
        reason?: string
    ) => {
        const success = await updateTripStatus(tripId, status, reason);
        return success;
    }, []);

    // Reset form
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
        // State
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

        // Trip filtering methods
        getTripsByStatus,
        getActiveTrips,

        // Actions
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