// hooks/useAuth.ts
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';

export function useAuth(requireAuth = false) {
    const { user, token, isLoading, error, initialize, login, register, logout, updateProfile, clearError } = useAuthStore();
    const router = useRouter();

    const isAuthenticated = !!token && !!user;

    // Initialize auth state on component mount
    useEffect(() => {
        initialize();
    }, []);

    // Redirect to login if auth is required but user is not authenticated
    useEffect(() => {
        if (requireAuth && !isLoading && !isAuthenticated) {
            //router.replace('/auth/login');
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
    };
}