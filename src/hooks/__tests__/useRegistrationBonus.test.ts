/**
 * useRegistrationBonus Hook Tests
 * Comprehensive tests for registration bonus functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useRegistrationBonus } from '@/hooks/useRegistrationBonus';
import { createWrapper } from '@/lib/test-utils';
import { registrationBonusApi } from '@/services/registrationBonusApi';

// Mock the registration bonus API (hook uses registrationBonusApi.getStatus)
jest.mock('@/services/registrationBonusApi');
const mockedRegistrationBonusApi =
  registrationBonusApi as jest.Mocked<typeof registrationBonusApi>;

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
        mockedRegistrationBonusApi.getStatus.mockResolvedValue({
            success: true,
            data: mockBonusData,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual({ success: true, data: mockBonusData });
        expect(result.current.error).toBeNull();
    });

    it('should handle bonus fetch error', async () => {
        const error = new Error('Failed to fetch bonus');
        mockedRegistrationBonusApi.getStatus.mockRejectedValue(error);

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(
            () => {
                expect(result.current.error).toBeTruthy();
            },
            { timeout: 3000 }
        );

        expect(result.current.data).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
    });

    it('should calculate progress correctly', async () => {
        mockedRegistrationBonusApi.getStatus.mockResolvedValue({
            success: true,
            data: mockBonusData,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.data?.progress).toBe(40); // 2/5 = 40%
        expect(result.current.data?.data?.completedTasks).toBe(2);
        expect(result.current.data?.data?.totalTasks).toBe(5);
    });

    it('should handle completed bonus (all tasks done)', async () => {
        const completedBonus = {
            ...mockBonusData,
            completedTasks: 5,
            progress: 100,
            tasks: mockBonusData.tasks.map(task => ({ ...task, completed: true })),
        };

        mockedRegistrationBonusApi.getStatus.mockResolvedValue({
            success: true,
            data: completedBonus,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.data?.progress).toBe(100);
        expect(result.current.data?.data?.completedTasks).toBe(5);
        expect(result.current.data?.data?.tasks.every((task: { completed: boolean }) => task.completed)).toBe(true);
    });

    it('should refetch bonus data', async () => {
        mockedRegistrationBonusApi.getStatus.mockResolvedValue({
            success: true,
            data: mockBonusData,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Update mock data for refetch
        const updatedData = {
            ...mockBonusData,
            completedTasks: 3,
            progress: 60,
        };
        mockedRegistrationBonusApi.getStatus.mockResolvedValue({
            success: true,
            data: updatedData,
        });

        // Trigger refetch
        result.current.refetch();

        await waitFor(() => {
            expect(result.current.data?.data?.completedTasks).toBe(3);
            expect(result.current.data?.data?.progress).toBe(60);
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

        mockedRegistrationBonusApi.getStatus.mockResolvedValue({
            success: true,
            data: emptyBonus,
        });

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data?.data?.progress).toBe(0);
        expect(result.current.data?.data?.completedTasks).toBe(0);
        expect(result.current.data?.data?.tasks.every((task: { completed: boolean }) => !task.completed)).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
        mockedRegistrationBonusApi.getStatus.mockRejectedValue(
            new Error('Service unavailable. Please try again later.')
        );

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(
            () => {
                expect(result.current.error).toBeTruthy();
            },
            { timeout: 3000 }
        );

        expect(result.current.data).toBeUndefined();
        expect(result.current.isLoading).toBe(false);
    });

    it('should handle unauthorized errors', async () => {
        mockedRegistrationBonusApi.getStatus.mockRejectedValue(
            new Error('Your session has expired. Please log in again.')
        );

        const { result } = renderHook(() => useRegistrationBonus(), {
            wrapper: createWrapper(),
        });

        await waitFor(
            () => {
                expect(result.current.error).toBeTruthy();
            },
            { timeout: 3000 }
        );
    });
});
