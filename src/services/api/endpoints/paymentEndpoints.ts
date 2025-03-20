// src/services/api/endpoints/paymentEndpoints.ts
import { apiClient } from '../apiClient';

/**
 * Interfaces para pagos y transacciones
 */
export interface PaymentMethod {
    id: string;
    type: 'CARD' | 'BANK_ACCOUNT' | 'WALLET';
    isDefault: boolean;
    lastFour?: string;
    brand?: string;
    holderName?: string;
    expiryDate?: string;
}

export interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
    tripId?: string;
    paymentMethodId: string;
    paymentMethod?: PaymentMethod;
    createdAt: string;
}

export interface WalletTransaction {
    id: string;
    type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND';
    amount: number;
    balance: number;
    description: string;
    status: 'PENDING' | 'COMPLETED' | 'FAILED';
    reference?: string;
    createdAt: string;
}

export interface Wallet {
    id: string;
    balance: number;
    currency: string;
    userId: string;
    lastTransactionAt?: string;
}

/**
 * Servicio de endpoints para pagos
 */
export const paymentEndpoints = {
    /**
     * Crea un nuevo pago
     */
    createPayment: async (paymentData: any): Promise<Payment> => {
        return apiClient.post<Payment>('/payments', paymentData);
    },

    /**
     * Obtiene historial de pagos
     */
    getPaymentHistory: async (): Promise<Payment[]> => {
        return apiClient.get<Payment[]>('/payments/user/history');
    },

    /**
     * Registra nuevo método de pago
     */
    addPaymentMethod: async (paymentMethodData: any): Promise<PaymentMethod> => {
        return apiClient.post<PaymentMethod>('/payments/methods', paymentMethodData);
    },

    /**
     * Obtiene métodos de pago del usuario
     */
    getPaymentMethods: async (): Promise<PaymentMethod[]> => {
        return apiClient.get<PaymentMethod[]>('/payments/methods');
    },

    /**
     * Elimina un método de pago
     */
    deletePaymentMethod: async (methodId: string): Promise<void> => {
        return apiClient.delete<void>(`/payments/methods/${methodId}`);
    },

    /**
     * Establece un método de pago como predeterminado
     */
    setDefaultPaymentMethod: async (methodId: string): Promise<PaymentMethod> => {
        return apiClient.patch<PaymentMethod>(`/payments/methods/${methodId}/default`);
    },

    /**
     * Aplica un código promocional
     */
    applyPromoCode: async (
        code: string,
        amount: number,
        tripType: string
    ): Promise<any> => {
        return apiClient.post<any>('/promotions/apply', {
            code,
            amount,
            tripType
        });
    }
};

/**
 * Servicio de endpoints para billetera
 */
export const walletEndpoints = {
    /**
     * Obtiene balance de la billetera
     */
    getWalletBalance: async (): Promise<Wallet> => {
        return apiClient.get<Wallet>('/wallets');
    },

    /**
     * Obtiene transacciones de la billetera
     */
    getWalletTransactions: async (limit?: number): Promise<WalletTransaction[]> => {
        return apiClient.get<WalletTransaction[]>(
            '/wallets/transactions',
            limit ? { limit } : undefined
        );
    },

    /**
     * Añade fondos a la billetera
     */
    depositToWallet: async (
        amount: number,
        description: string
    ): Promise<WalletTransaction> => {
        return apiClient.post<WalletTransaction>('/wallets/deposit', {
            amount,
            description
        });
    },

    /**
     * Retira fondos de la billetera
     */
    withdrawFromWallet: async (
        amount: number,
        description: string
    ): Promise<WalletTransaction> => {
        return apiClient.post<WalletTransaction>('/wallets/withdraw', {
            amount,
            description
        });
    },

    /**
     * Transfiere fondos a otro usuario
     */
    transferFunds: async (
        recipientId: string,
        amount: number,
        description: string
    ): Promise<WalletTransaction> => {
        return apiClient.post<WalletTransaction>('/wallets/transfer', {
            recipientId,
            amount,
            description
        });
    }
};