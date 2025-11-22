/**
 * useRegistrationBonus Hook Tests
 * Comprehensive tests for registration bonus functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useRegistrationBonus } from '@/hooks/useRegistrationBonus';
import { createWrapper } from '@/lib/test-utils';
import { api } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('useRegistrationBonus', () => {
    const mockBonusData = {
        totalTasks: 5,
        completedTasks: 2,
        progress: 40,
        availableBonus: 50,
        tasks: [
            { id: 1, name: 'Verify Email', completed: true, reward: 10 },
            { id: 2, name: 'Complete Profile', completed: true, reward: 10 },
            { id: 3, name: 'Make First Deposit', completed: false, reward: 15 },
            { id: 4, name: 'Connect Social Media', completed: false, reward: 10 },
            { id: 5, name: 'Make First Stake', completed: false, reward: 15 },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch registration bonus data successfully', async () => {
        mockedApi.get.mockResolvedValue({
            success: true,
            data: mockBonusData,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual(mockBonusData);
        expect(result.current.error).toBeNull();
    });

    it('should handle bonus fetch error', async () => {
        const error = new Error('Failed to fetch bonus');
        mockedApi.get.mockRejectedValue(error);

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toBeUndefined();
        expect(result.current.error).toBeTruthy();
    });

    it('should calculate progress correctly', async () => {
        mockedApi.get.mockResolvedValue({
            success: true,
            data: mockBonusData,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.progress).toBe(40); // 2/5 = 40%
        expect(result.current.data?.completedTasks).toBe(2);
        expect(result.current.data?.totalTasks).toBe(5);
    });

    it('should handle completed bonus (all tasks done)', async () => {
        const completedBonus = {
            ...mockBonusData,
            completedTasks: 5,
            progress: 100,
            tasks: mockBonusData.tasks.map(task => ({ ...task, completed: true })),
        };

        mockedApi.get.mockResolvedValue({
            success: true,
            data: completedBonus,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.progress).toBe(100);
        expect(result.current.data?.completedTasks).toBe(5);
        expect(result.current.data?.tasks.every(task => task.completed)).toBe(true);
    });

    it('should refetch bonus data', async () => {
        mockedApi.get.mockResolvedValue({
            success: true,
            data: mockBonusData,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Update mock data
        const updatedData = {
            ...mockBonusData,
            completedTasks: 3,
            progress: 60,
        };
        mockedApi.get.mockResolvedValue({
            success: true,
            data: updatedData,
        });

        // Trigger refetch
        result.current.refetch();

        await waitFor(() => {
            expect(result.current.data?.completedTasks).toBe(3);
            expect(result.current.data?.progress).toBe(60);
        });
    });

    it('should handle empty bonus data (new user)', async () => {
        const emptyBonus = {
            totalTasks: 5,
            completedTasks: 0,
            progress: 0,
            availableBonus: 50,
            tasks: mockBonusData.tasks.map(task => ({ ...task, completed: false })),
        };

        mockedApi.get.mockResolvedValue({
            success: true,
            data: emptyBonus,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.progress).toBe(0);
        expect(result.current.data?.completedTasks).toBe(0);
        expect(result.current.data?.tasks.every(task => !task.completed)).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
        mockedApi.get.mockRejectedValue({
            response: { status: 503, statusText: 'Service Unavailable' },
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
        expect(result.current.data).toBeUndefined();
    });

    it('should handle unauthorized errors', async () => {
        mockedApi.get.mockRejectedValue({
            response: { status: 401, statusText: 'Unauthorized' },
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeTruthy();
    });
});
