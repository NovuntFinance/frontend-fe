/**
 * Zustand Store for Share Modal
 * Manages share modal state globally
 */

import { create } from 'zustand';
import type { ShareType } from '@/components/share/ShareSuccessModal';

interface ShareData {
    title: string;
    message: string;
    amount?: number;
    imageUrl?: string;
}

interface ShareModalState {
    isOpen: boolean;
    type: ShareType | null;
    data: ShareData | null;

    // Actions
    openShareModal: (type: ShareType, data: ShareData) => void;
    closeShareModal: () => void;
}

export const useShareModalStore = create<ShareModalState>((set) => ({
    isOpen: false,
    type: null,
    data: null,

    openShareModal: (type, data) => {
        set({ isOpen: true, type, data });
    },

    closeShareModal: () => {
        set({ isOpen: false, type: null, data: null });
    },
}));

// Helper function for easy access
export function openShareModal(type: ShareType, data: ShareData) {
    useShareModalStore.getState().openShareModal(type, data);
}
