// src/hooks/useTrip.ts
import { useCallback, useEffect, useState, useRef } from 'react';
import { useTripStore, Location, TripRequest, Trip } from '@/src/stores/tripStore';
import { tripService } from '../services/core/tripService';
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';
import { websocketService } from '../services/core/websocketService';
import { useToast } from '@/src/components/ui';

/**
 * Hook para gestionar viajes, incluyendo actualizaciones en tiempo real
 * @param tripId ID opcional del viaje actual
 */
export function useTrip(tripId?: string) {
    const { isAuthenticated, token } = useAuth(true); // Requiere autenticación
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
    const toast = useToast();
    const router = useRouter();
    const [routeError, setRouteError] = useState(false);
    const [wsInitialized, setWsInitialized] = useState(false);
    const [driverLocation, setDriverLocation] = useState<{
        latitude: number;
        longitude: number;
        heading?: number;
    } | null>(null);
    const [estimatedArrival, setEstimatedArrival] = useState<number>(0);
    const [searchTimeElapsed, setSearchTimeElapsed] = useState(0);
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

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

    // Inicializar WebSocket cuando el usuario está autenticado
    useEffect(() => {
        if (isAuthenticated && token && !wsInitialized) {
            websocketService.initialize(token);
            setWsInitialized(true);
        }
    }, [isAuthenticated, token, wsInitialized]);

    // Suscribirse a actualizaciones del viaje específico si se proporciona ID
    useEffect(() => {
        if (isAuthenticated && tripId && wsInitialized) {
            // Cargar detalles del viaje primero
            fetchTripDetails(tripId).then(trip => {
                // Iniciar el temporizador de búsqueda si está en estado SEARCHING
                if (trip && trip.status === 'SEARCHING') {
                    startSearchTimer();
                }
            });

            // Suscribirse a actualizaciones en tiempo real
            websocketService.subscribeToTrip(tripId).catch(error => {
                console.error('Error al suscribirse a actualizaciones del viaje:', error);
            });

            // Configurar manejadores de eventos
            setupWebSocketEventHandlers(tripId);

            // Limpieza al desmontar
            return () => {
                cleanupWebSocketEventHandlers();
                stopSearchTimer();
            };
        }
    }, [isAuthenticated, tripId, wsInitialized]);

    // Configurar manejadores de eventos WebSocket
    const setupWebSocketEventHandlers = (currentTripId: string) => {
        // Actualización de estado del viaje
        const handleTripUpdate = (data: any) => {
            if (data.tripId === currentTripId) {
                // Actualizar el viaje en el store
                fetchTripDetails(currentTripId);

                // Si cambió a CONFIRMED, detener temporizador de búsqueda
                if (data.status === 'CONFIRMED') {
                    stopSearchTimer();
                    toast.success('¡Conductor asignado! Está en camino.');
                }

                // Si terminó o se canceló, mostrar notificación
                if (data.status === 'COMPLETED') {
                    toast.success('¡Viaje completado!');
                } else if (data.status === 'CANCELLED') {
                    toast.warning('Viaje cancelado: ' + (data.additionalData?.reason || ''));
                }
            }
        };

        // Actualización de ubicación del conductor
        const handleDriverLocation = (data: any) => {
            if (data.tripId === currentTripId) {
                setDriverLocation({
                    latitude: data.location.latitude,
                    longitude: data.location.longitude,
                    heading: data.heading
                });

                // Actualizar tiempo estimado si está disponible
                if (data.additionalData?.estimatedArrival) {
                    setEstimatedArrival(data.additionalData.estimatedArrival);
                }
            }
        };

        // Notificaciones específicas del viaje
        const handleTripNotification = (data: any) => {
            if (data.tripId === currentTripId) {
                switch (data.type) {
                    case 'success':
                        toast.success(data.message);
                        break;
                    case 'warning':
                        toast.warning(data.message);
                        break;
                    case 'error':
                        toast.error(data.message);
                        break;
                    default:
                        toast.info(data.message);
                }
            }
        };

        // Registrar los manejadores
        websocketService.on('trip_updated', handleTripUpdate);
        websocketService.on('driver_location', handleDriverLocation);
        websocketService.on('trip_notification', handleTripNotification);
    };

    // Limpiar manejadores de eventos WebSocket
    const cleanupWebSocketEventHandlers = () => {
        // Dado que se están usando funciones anónimas, no podemos hacer un off específico
        // Pero esto no será un problema ya que los manejadores verifican el tripId
        // En una implementación real, guardaríamos referencias a los manejadores para eliminarlos específicamente
    };

    // Iniciar temporizador para estado SEARCHING
    const startSearchTimer = () => {
        // Limpiar temporizador existente si lo hay
        stopSearchTimer();

        // Iniciar uno nuevo
        setSearchTimeElapsed(0);
        searchTimerRef.current = setInterval(() => {
            setSearchTimeElapsed(prev => {
                const newValue = prev + 1;

                // Si alcanza el límite (2 minutos = 120 segundos), cancelar automáticamente
                if (newValue >= 120 && tripId && activeTrip?.status === 'SEARCHING') {
                    updateTripStatus(tripId, 'CANCELLED', 'No se encontró un conductor disponible');
                    stopSearchTimer();
                    toast.warning('No se encontró un conductor disponible. El viaje ha sido cancelado.');
                }

                return newValue;
            });
        }, 1000);
    };

    // Detener temporizador
    const stopSearchTimer = () => {
        if (searchTimerRef.current) {
            clearInterval(searchTimerRef.current);
            searchTimerRef.current = null;
        }
    };

    // Cargar viaje específico si se proporciona ID
    useEffect(() => {
        if (isAuthenticated && tripId && !activeTrip) {
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
            // Iniciar el temporizador de búsqueda
            startSearchTimer();

            // Suscribirse a actualizaciones en tiempo real
            if (wsInitialized) {
                try {
                    await websocketService.subscribeToTrip(trip.id);
                    setupWebSocketEventHandlers(trip.id);
                } catch (error) {
                    console.error('Error al suscribirse a actualizaciones del viaje:', error);
                }
            }

            router.push(`/trip/details?tripId=${trip.id}`);
        }
        return trip;
    }, [origin, destination, tripType, scheduledAt, availableSeats, pricePerSeat, wsInitialized]);

    // Manejar actualización de estado del viaje
    const handleUpdateStatus = useCallback(async (
        tripId: string,
        status: string,
        reason?: string
    ) => {
        // Si el viaje se cancela, detener el temporizador de búsqueda
        if (status === 'CANCELLED') {
            stopSearchTimer();
        }

        const success = await updateTripStatus(tripId, status, reason);
        return success;
    }, []);

    // Cancelar viaje
    const cancelTrip = useCallback(async (tripId: string, reason: string) => {
        try {
            const success = await handleUpdateStatus(tripId, 'CANCELLED', reason);
            if (success) {
                stopSearchTimer();
                toast.info('Viaje cancelado');
            }
            return success;
        } catch (error) {
            console.error('Error cancelando viaje:', error);
            return false;
        }
    }, [handleUpdateStatus]);

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
        stopSearchTimer();
        setSearchTimeElapsed(0);
        setDriverLocation(null);
    }, []);

    // Desuscribirse de viaje activo al desmontar componente
    useEffect(() => {
        return () => {
            if (tripId && wsInitialized) {
                websocketService.unsubscribeFromTrip(tripId);
            }
        };
    }, [tripId, wsInitialized]);

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
        driverLocation,
        estimatedArrival,
        searchTimeElapsed,

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
        cancelTrip,
        acceptTrip,
        rateTrip,
        fetchTripDetails,
        fetchTrips: refreshAllTrips,
        resetForm,
        clearError,

        // Estado del WebSocket
        wsConnected: wsInitialized && websocketService.isConnected()
    };
}