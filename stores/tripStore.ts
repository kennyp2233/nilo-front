// stores/tripStore.ts
import { create } from 'zustand';
import { apiService } from '@/services/api.service';
import { LocationService } from '@/services/location.service';

export interface Location {
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
    scheduledAt?: string; // ISO date string for scheduled trips
    availableSeats?: number; // For intercity trips
    pricePerSeat?: number; // For intercity trips
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
    // Additional fields based on type
    availableSeats?: number;
    pricePerSeat?: number;
    // Populated relations
    driver?: any;
    vehicle?: any;
    passenger?: any;
    payment?: any;
}

interface TripState {
    trips: Trip[];
    activeTrip: Trip | null;
    isLoading: boolean;
    error: string | null;
    route: any | null;

    // Actions
    fetchTrips: (status?: string) => Promise<void>;
    fetchTripDetails: (tripId: string) => Promise<Trip | null>;
    createTrip: (tripRequest: TripRequest) => Promise<Trip | null>;
    updateTripStatus: (tripId: string, status: string, reason?: string) => Promise<boolean>;
    acceptTrip: (tripId: string) => Promise<boolean>;
    rateTrip: (tripId: string, toUserId: string, score: number, comment?: string) => Promise<boolean>;
    fetchRoute: (startLocation: Location, endLocation: Location) => Promise<any>;
    clearError: () => void;
    setActiveTrip: (trip: Trip | null) => void;
}

export const useTripStore = create<TripState>((set, get) => ({
    trips: [],
    activeTrip: null,
    isLoading: false,
    error: null,
    route: null,

    // Fetch all trips or filtered by status
    fetchTrips: async (status?: string) => {
        set({ isLoading: true, error: null });
        try {
            const trips = await apiService.getTrips(status);
            set({ trips, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch trips:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to fetch trips'
            });
        }
    },

    // Fetch details of a specific trip
    fetchTripDetails: async (tripId: string) => {
        set({ isLoading: true, error: null });
        try {
            const trip = await apiService.getTripDetails(tripId);
            set({ activeTrip: trip, isLoading: false });
            return trip;
        } catch (error: any) {
            console.error(`Failed to fetch trip details for ID ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to fetch trip details'
            });
            return null;
        }
    },

    // Create a new trip
    createTrip: async (tripRequest: TripRequest) => {
        set({ isLoading: true, error: null });
        try {
            const trip = await apiService.createTrip(tripRequest);
            set({
                activeTrip: trip,
                trips: [trip, ...get().trips],
                isLoading: false
            });
            return trip;
        } catch (error: any) {
            console.error('Failed to create trip:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to create trip'
            });
            return null;
        }
    },

    // Update trip status
    updateTripStatus: async (tripId: string, status: string, reason?: string) => {
        set({ isLoading: true, error: null });
        try {
            const statusData: any = { status };
            if (reason && status === 'CANCELLED') {
                statusData.cancellationReason = reason;
            }

            const updatedTrip = await apiService.updateTripStatus(tripId, statusData);

            // Update active trip if it's the same
            if (get().activeTrip?.id === tripId) {
                set({ activeTrip: updatedTrip });
            }

            // Update in trips list
            const updatedTrips = get().trips.map(trip =>
                trip.id === tripId ? updatedTrip : trip
            );

            set({ trips: updatedTrips, isLoading: false });
            return true;
        } catch (error: any) {
            console.error(`Failed to update trip status for ID ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to update trip status'
            });
            return false;
        }
    },

    // Accept a trip (for drivers)
    acceptTrip: async (tripId: string) => {
        set({ isLoading: true, error: null });
        try {
            const acceptedTrip = await apiService.acceptTrip(tripId);

            // Update active trip if it's the same
            if (get().activeTrip?.id === tripId) {
                set({ activeTrip: acceptedTrip });
            }

            // Update in trips list
            const updatedTrips = get().trips.map(trip =>
                trip.id === tripId ? acceptedTrip : trip
            );

            set({ trips: updatedTrips, isLoading: false });
            return true;
        } catch (error: any) {
            console.error(`Failed to accept trip for ID ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to accept trip'
            });
            return false;
        }
    },

    // Rate a trip
    rateTrip: async (tripId: string, toUserId: string, score: number, comment?: string) => {
        set({ isLoading: true, error: null });
        try {
            const ratingData = { toUserId, score, comment };
            await apiService.rateTrip(tripId, ratingData);
            set({ isLoading: false });
            return true;
        } catch (error: any) {
            console.error(`Failed to rate trip for ID ${tripId}:`, error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to rate trip'
            });
            return false;
        }
    },

    // Fetch route between two locations
    fetchRoute: async (startLocation: Location, endLocation: Location) => {
        set({ isLoading: true, error: null, route: null });
        try {
            const route = await LocationService.getRoute(
                [startLocation.latitude, startLocation.longitude],
                [endLocation.latitude, endLocation.longitude]
            );
            set({ route, isLoading: false });
            return route;
        } catch (error: any) {
            console.error('Failed to fetch route:', error);
            set({
                isLoading: false,
                error: error?.response?.data?.message || error.message || 'Failed to fetch route'
            });
            return null;
        }
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Set active trip
    setActiveTrip: (trip: Trip | null) => set({ activeTrip: trip })
}));