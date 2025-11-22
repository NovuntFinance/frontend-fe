/**
 * useWallet Hook Tests
 * Comprehensive tests for wallet functionality
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useWallet } from '@/hooks/useWallet';
import { createWrapper } from '@/lib/test-utils';
import { api } from '@/lib/api';

// Mock the API
jest.mock('@/lib/api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('useWallet', () => {
    const mockWalletData = {
        totalBalance: 1000,
        fundedWalletBalance: 600,
        earningWalletBalance: 400,
        canStake: true,
        canWithdraw: true,
        canTransfer: true,
        statistics: {
            totalDeposited: 5000,
            totalWithdrawn: 3000,
            totalStaked: 2000,
            totalEarned: 500,
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should fetch wallet data successfully', async () => {
        mockedApi.get.mockResolvedValue({
            success: true,
            data: mockWalletData,
        });

        const { result } = renderHook(() => useWallet(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.wallet).toEqual(mockWalletData);
        expect(result.current.error).toBeNull();
    });

    it('should handle wallet fetch error', async () => {
        const error = new Error('Failed to fetch wallet');
        mockedApi.get.mockRejectedValue(error);

        const { result } = renderHook(() => useWallet(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.wallet).toBeUndefined();
        expect(result.current.error).toBeTruthy();
    });

    it('should return empty wallet for 404 errors', async () => {
        mockedApi.get.mockRejectedValue({
            response: { status: 404 },
        });

        const { result } = renderHook(() => useWallet(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Should return empty wallet structure
        expect(result.current.wallet?.totalBalance).toBe(0);
    });

    it('should refetch wallet data', async () => {
        mockedApi.get.mockResolvedValue({
            success: true,
            data: mockWalletData,
        });

        const { result } = renderHook(() => useWallet(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        // Update mock data
        const updatedData = { ...mockWalletData, totalBalance: 2000 };
        mockedApi.get.mockResolvedValue({
            success: true,
            data: updatedData,
        });

        // Trigger refetch
        result.current.refetch();

        await waitFor(() => {
            expect(result.current.wallet?.totalBalance).toBe(2000);
        });
    });

    it('should calculate wallet permissions correctly', async () => {
        const restrictedWallet = {
            ...mockWalletData,
            canWithdraw: false,
            canTransfer: false,
        };

        mockedApi.get.mockResolvedValue({
            success: true,
            data: restrictedWallet,
        });

        const { result } = renderHook(() => useWallet(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.wallet?.canStake).toBe(true);
        expect(result.current.wallet?.canWithdraw).toBe(false);
        expect(result.current.wallet?.canTransfer).toBe(false);
    });
});
