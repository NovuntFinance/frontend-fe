/**
 * Wallet Store
 * Manages wallet state and balances
 */

import { create } from 'zustand';
import { Wallet, WalletBalance } from '@/types/wallet';

interface WalletState {
  // State
  wallets: {
    funded: Wallet | null;
    earnings: Wallet | null;
  };
  balances: WalletBalance | null;
  isLoading: boolean;
  
  // Actions
  setWallets: (funded: Wallet, earnings: Wallet) => void;
  setBalances: (balances: WalletBalance) => void;
  updateBalance: (walletType: 'funded' | 'earnings', balance: number) => void;
  clearWallets: () => void;
  setLoading: (loading: boolean) => void;
  
  // Helpers
  getTotalBalance: () => number;
  getAvailableBalance: (walletType: 'funded' | 'earnings') => number;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  // Initial state
  wallets: {
    funded: null,
    earnings: null,
  },
  balances: null,
  isLoading: false,
  
  // Set both wallets
  setWallets: (funded, earnings) => {
    set({
      wallets: { funded, earnings },
    });
  },
  
  // Set wallet balances
  setBalances: (balances) => {
    set({ balances });
  },
  
  // Update specific wallet balance
  updateBalance: (walletType, balance) => {
    const currentWallet = get().wallets[walletType];
    if (currentWallet) {
      set({
        wallets: {
          ...get().wallets,
          [walletType]: {
            ...currentWallet,
            balance,
            availableBalance: balance,
          },
        },
      });
    }
    
    // Update balances object too
    const currentBalances = get().balances;
    if (currentBalances) {
      set({
        balances: {
          ...currentBalances,
          [walletType]: {
            ...currentBalances[walletType],
            balance,
            availableBalance: balance,
          },
          total: walletType === 'funded'
            ? balance + currentBalances.earnings.balance
            : currentBalances.funded.balance + balance,
        },
      });
    }
  },
  
  // Clear wallet data
  clearWallets: () => {
    set({
      wallets: {
        funded: null,
        earnings: null,
      },
      balances: null,
    });
  },
  
  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  // Get total balance across both wallets
  getTotalBalance: () => {
    return get().balances?.total ?? 0;
  },
  
  // Get available balance for specific wallet
  getAvailableBalance: (walletType) => {
    return get().balances?.[walletType]?.availableBalance ?? 0;
  },
}));
