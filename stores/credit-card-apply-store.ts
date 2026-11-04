import { create } from 'zustand';
import type { CreditCardOffer } from '@/types/credit-card';

interface CreditCardApplyState {
  selectedOffer: CreditCardOffer | null;
  isModalOpen: boolean;
  startApply: (offer: CreditCardOffer) => void;
  closeApply: () => void;
}

/**
 * Holds the selected credit card while login / form / redirect runs.
 */
export const useCreditCardApplyStore = create<CreditCardApplyState>((set) => ({
  selectedOffer: null,
  isModalOpen: false,
  startApply: (offer) =>
    set({
      selectedOffer: offer,
      isModalOpen: true,
    }),
  closeApply: () =>
    set({
      selectedOffer: null,
      isModalOpen: false,
    }),
}));
