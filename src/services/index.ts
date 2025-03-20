// src/services/index.ts

// Exportar API completa
export { api } from './api';

// Exportar servicios core
export { authService } from './core/authService';
export { locationService } from './core/location.service';
export { storageService } from './core/storageService';
export { tripService } from './core/tripService';

// Re-exportar tipos usados frecuentemente
export type {
    LoginCredentials,
    RegisterUserData
} from './api/endpoints/authEndpoints';

export type {
    Location,
    Trip,
    TripRequest
} from './api/endpoints/tripEndpoints';

export type {
    UserProfile,
    VehicleData
} from './api/endpoints/userEndpoints';

export type {
    Payment,
    PaymentMethod,
    Wallet,
    WalletTransaction
} from './api/endpoints/paymentEndpoints';