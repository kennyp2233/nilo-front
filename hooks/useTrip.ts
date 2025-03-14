// hooks/useTrip.ts
import { useCallback, useEffect, useState } from 'react';
import { useTripStore, Location, TripRequest, Trip } from '@/stores/tripStore';
import { useAuth } from '@/hooks/useAuth';
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

    // Local state for form handling
    const [origin, setOrigin] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);
    const [tripType, setTripType] = useState<'ON_DEMAND' | 'INTERCITY'>('ON_DEMAND');
    const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
    const [availableSeats, setAvailableSeats] = useState<number>(1);
    const [pricePerSeat, setPricePerSeat] = useState<number | null>(null);

    // Load specific trip if ID provided
    useEffect(() => {
        if (isAuthenticated && tripId) {
            fetchTripDetails(tripId);
        }
    }, [isAuthenticated, tripId]);

    // Fetch all trips when authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchTrips();
        }
    }, [isAuthenticated]);

    // Update route when origin and destination change
    useEffect(() => {
        if (origin && destination) {
            fetchRoute(origin, destination);
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
            router.push(`/trips/${trip.id}`);
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
    }, []);

    return {
        // State
        trips,
        activeTrip,
        isLoading,
        error,
        route,
        origin,
        destination,
        tripType,
        scheduledAt,
        availableSeats,
        pricePerSeat,

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
        fetchTrips,
        resetForm,
        clearError
    };
}