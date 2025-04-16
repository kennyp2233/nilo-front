// src/hooks/useAuth.ts (Refactorizado)
import { useEffect } from 'react';
import { useAuthStore } from '@/src/stores/authStore';
import { useRouter } from 'expo-router';

/**
 * Hook para gestionar autenticación
 * @param requireAuth Si es true, redirige a login si no hay usuario autenticado
 */
export function useAuth(requireAuth = false) {
    const {
        user,
        token,
        isLoading,
        error,
        initialize,
        login,
        register,
        logout,
        updateProfile,
        clearError
    } = useAuthStore();
    const router = useRouter();

    const isAuthenticated = !!token && !!user;

    // Inicializar estado de autenticación al montar el componente
    useEffect(() => {
        initialize();
    }, []);

    // Redirigir a login si se requiere autenticación pero el usuario no está autenticado
    useEffect(() => {
        if (requireAuth && !isLoading && !isAuthenticated) {
            router.replace('/auth/login');
        }
    }, [requireAuth, isLoading, isAuthenticated, router]);

    return {
        user,
        isLoading,
        isAuthenticated,
        error,
        login,
        register,
        logout,
        updateProfile,
        clearError,
        token
    };
}