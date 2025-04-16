// src/services/core/websocketService.ts
import { io, Socket } from 'socket.io-client';

// API Base URL - Utiliza variable de entorno o valor por defecto
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

/**
 * Tipos para los eventos de WebSocket
 */
export interface TripUpdateEvent {
    tripId: string;
    status: string;
    additionalData?: any;
}

export interface DriverLocationEvent {
    tripId: string;
    location: {
        latitude: number;
        longitude: number;
    };
    heading?: number; // Dirección en grados (0-360)
}

export interface TripNotificationEvent {
    tripId: string;
    message: string;
    type?: 'info' | 'warning' | 'error' | 'success';
    data?: any;
}

export interface RatingReceivedEvent {
    tripId: string;
    score: number;
    comment?: string;
    fromUserType: 'DRIVER' | 'PASSENGER';
}

/**
 * Servicio para manejar comunicación en tiempo real con WebSockets
 * Gestiona conexión, reconexión y eventos relacionados con viajes
 */
export class WebSocketService {
    private static instance: WebSocketService;
    private socket: Socket | null = null;
    private token: string | null = null;
    private activeTrips: Set<string> = new Set();
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    private reconnectInterval: number = 1000; // ms
    private reconnectTimeout: NodeJS.Timeout | null = null;

    private eventHandlers: {
        [eventName: string]: Array<(data: any) => void>;
    } = {};

    /**
     * Constructor privado para implementar Singleton
     */
    private constructor() { }

    /**
     * Obtiene la instancia única del servicio WebSocket
     */
    public static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    /**
     * Inicializa la conexión WebSocket con el token proporcionado
     */
    public initialize(token: string): void {
        this.token = token;

        // Si ya hay una conexión activa, no hacer nada
        if (this.socket && this.socket.connected) {
            console.log('WebSocket ya está conectado');
            return;
        }

        // Crear nueva conexión
        this.socket = io(`${API_URL}/trips`, {
            transports: ['websocket'],
            autoConnect: true,
            query: { token }
        });

        // Configurar manejadores de eventos de conexión
        this.setupConnectionHandlers();
    }

    /**
     * Configura los manejadores para eventos de conexión
     */
    private setupConnectionHandlers(): void {
        if (!this.socket) return;

        // Evento de conexión exitosa
        this.socket.on('connect', () => {
            console.log('WebSocket conectado');
            this.reconnectAttempts = 0;

            // Autenticar con token JWT
            this.socket?.emit('authenticate', { token: this.token }, (response: any) => {
                if (response.success) {
                    console.log('WebSocket autenticado');

                    // Resuscribir a viajes activos después de reconexión
                    this.resubscribeToActiveTrips();
                } else {
                    console.error('Error de autenticación WebSocket:', response.message);
                }
            });
        });

        // Evento de desconexión
        this.socket.on('disconnect', (reason: string) => {
            console.log(`WebSocket desconectado: ${reason}`);

            // Si hay viajes activos, intentar reconectar
            if (this.activeTrips.size > 0 && this.reconnectAttempts < this.maxReconnectAttempts) {
                this.attemptReconnect();
            }
        });

        // Manejar errores
        this.socket.on('error', (error: any) => {
            console.error('Error de WebSocket:', error);
        });

        // Configurar manejadores para eventos de viajes
        this.setupTripEventHandlers();
    }

    /**
     * Configura los manejadores para eventos relacionados con viajes
     */
    private setupTripEventHandlers(): void {
        if (!this.socket) return;

        // Evento: Actualización de estado de viaje
        this.socket.on('trip_updated', (data: TripUpdateEvent) => {
            console.log(`WebSocket: Viaje ${data.tripId} actualizado a estado ${data.status}`);
            this.notifyListeners('trip_updated', data);

            // Si el viaje terminó o se canceló, programar desuscripción
            if (data.status === 'COMPLETED' || data.status === 'CANCELLED') {
                setTimeout(() => {
                    this.unsubscribeFromTrip(data.tripId);
                }, 10000); // Mantener suscripción por 10 segundos más
            }
        });

        // Evento: Actualización de ubicación del conductor
        this.socket.on('driver_location', (data: DriverLocationEvent) => {
            this.notifyListeners('driver_location', data);
        });

        // Evento: Notificación relacionada con el viaje
        this.socket.on('trip_notification', (data: TripNotificationEvent) => {
            console.log(`WebSocket: Notificación del viaje ${data.tripId}: ${data.message}`);
            this.notifyListeners('trip_notification', data);
        });

        // Evento: Calificación recibida
        this.socket.on('rating_received', (data: RatingReceivedEvent) => {
            this.notifyListeners('rating_received', data);
        });
    }

    /**
     * Suscribirse a actualizaciones de un viaje específico
     */
    public subscribeToTrip(tripId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.socket || !this.socket.connected) {
                console.error('No hay conexión WebSocket activa');
                reject(new Error('No hay conexión WebSocket activa'));
                return;
            }

            this.socket.emit('subscribe_trip', { tripId, token: this.token }, (response: any) => {
                if (response && response.success) {
                    console.log(`WebSocket: Suscrito al viaje ${tripId}`);
                    this.activeTrips.add(tripId);
                    resolve(true);
                } else {
                    console.error(`Error al suscribirse al viaje ${tripId}:`, response?.message || 'Error desconocido');
                    reject(new Error(response?.message || 'Error al suscribirse al viaje'));
                }
            });
        });
    }

    /**
     * Desuscribirse de un viaje específico
     */
    public unsubscribeFromTrip(tripId: string): Promise<boolean> {
        return new Promise((resolve) => {
            if (!this.socket || !this.socket.connected) {
                this.activeTrips.delete(tripId);
                resolve(false);
                return;
            }

            this.socket.emit('unsubscribe_trip', { tripId }, (response: any) => {
                this.activeTrips.delete(tripId);
                console.log(`WebSocket: Desuscrito del viaje ${tripId}`);
                resolve(response && response.success);

                // Si no hay más viajes activos, cerrar conexión
                if (this.activeTrips.size === 0) {
                    this.disconnect();
                }
            });
        });
    }

    /**
     * Resuscribirse a todos los viajes activos (después de reconexión)
     */
    private resubscribeToActiveTrips(): void {
        this.activeTrips.forEach(tripId => {
            this.subscribeToTrip(tripId).catch(error => {
                console.error(`Error al resuscribirse al viaje ${tripId}:`, error);
            });
        });
    }

    /**
     * Intenta reconectar con backoff exponencial
     */
    private attemptReconnect(): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }

        const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts);
        console.log(`Intentando reconectar WebSocket en ${delay}ms...`);

        this.reconnectTimeout = setTimeout(() => {
            if (this.socket) {
                this.socket.connect();
            } else if (this.token) {
                this.initialize(this.token);
            }
            this.reconnectAttempts++;
        }, delay);
    }

    /**
     * Desconectar WebSocket
     */
    public disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }

        this.activeTrips.clear();
        console.log('WebSocket desconectado manualmente');
    }

    /**
     * Registra un manejador para un evento específico
     */
    public on(eventName: string, handler: (data: any) => void): void {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }

    /**
     * Elimina un manejador para un evento específico
     */
    public off(eventName: string, handler: (data: any) => void): void {
        if (!this.eventHandlers[eventName]) return;

        const index = this.eventHandlers[eventName].indexOf(handler);
        if (index !== -1) {
            this.eventHandlers[eventName].splice(index, 1);
        }
    }

    /**
     * Notifica a todos los manejadores registrados para un evento
     */
    private notifyListeners(eventName: string, data: any): void {
        if (!this.eventHandlers[eventName]) return;

        this.eventHandlers[eventName].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error en manejador de evento ${eventName}:`, error);
            }
        });
    }

    /**
     * Verifica si el WebSocket está conectado
     */
    public isConnected(): boolean {
        return !!this.socket && this.socket.connected;
    }
}

// Exportamos una instancia única
export const websocketService = WebSocketService.getInstance();