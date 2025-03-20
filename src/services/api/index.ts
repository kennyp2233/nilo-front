// src/services/api/index.ts
import { apiClient } from './apiClient';
import { authEndpoints } from './endpoints/authEndpoints';
import { tripEndpoints } from './endpoints/tripEndpoints';
import { locationEndpoints } from './endpoints/locationEndpoints';
import { userEndpoints, vehicleEndpoints } from './endpoints/userEndpoints';
import { paymentEndpoints, walletEndpoints } from './endpoints/paymentEndpoints';

/**
 * API completa que combina todos los endpoints
 */
export const api = {
    // Cliente base de API
    client: apiClient,

    // Agrupación de endpoints por dominio
    auth: authEndpoints,
    trips: tripEndpoints,
    locations: locationEndpoints,
    users: userEndpoints,
    vehicles: vehicleEndpoints,
    payments: paymentEndpoints,
    wallet: walletEndpoints
};

// Exportamos todos los tipos relevantes
export * from './endpoints/authEndpoints';
export * from './endpoints/tripEndpoints';
export * from './endpoints/userEndpoints';
export * from './endpoints/paymentEndpoints';