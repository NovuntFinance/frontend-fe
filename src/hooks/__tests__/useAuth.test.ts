/**
 * useAuth Hook Tests
 * Testing authentication hook functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { renderWithProviders, setupLocalStorageMock } from '@/lib/test-utils';
import { useAuth } from '../useAuth';

// Mock the auth store
jest.mock('@/store/authStore', () => ({
    useAuthStore: () => ({
        user: {
            id: 'user-123',
            email: 'test@example.com',
            fname: 'Test',
            lname: 'User',
        },
        isAuthenticated: true,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
        checkAuth: jest.fn(),
    }),
}));

describe('useAuth', () => {
    beforeEach(() => {
        setupLocalStorageMock();
    });

    it('should return user data when authenticated', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.user).toBeDefined();
        expect(result.current.user?.email).toBe('test@example.com');
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should provide login function', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.login).toBeDefined();
        expect(typeof result.current.login).toBe('function');
    });

    it('should provide logout function', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.logout).toBeDefined();
        expect(typeof result.current.logout).toBe('function');
    });

    it('should indicate loading state', () => {
        const { result } = renderHook(() => useAuth());

        expect(result.current.isLoading).toBeDefined();
        expect(typeof result.current.isLoading).toBe('boolean');
    });
});
