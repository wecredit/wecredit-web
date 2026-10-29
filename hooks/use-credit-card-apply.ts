'use client';

/**
 * Apply Now: login gate, then open credit-card apply modal
 * (get-creditcard-leads check → form or utmLink redirect).
 */

import { useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCreditCardApplyStore } from '@/stores/credit-card-apply-store';
import type { CreditCardOffer } from '@/types/credit-card';

interface UseCreditCardApplyReturn {
  handleApplyNow: (card: CreditCardOffer) => void;
}

/**
 * Starts credit-card apply: auth first, then status check / form modal.
 */
export function useCreditCardApply(): UseCreditCardApplyReturn {
  const { isAuthenticated, openAuthModalWithAction } = useAuth();
  const startApply = useCreditCardApplyStore((state) => state.startApply);

  const handleApplyNow = useCallback(
    (card: CreditCardOffer): void => {
      if (!isAuthenticated) {
        openAuthModalWithAction({
          type: 'apply_credit_card',
          creditCardName: card.name,
          href: card.link,
          lenderName: card.title,
          lenderId: card.id,
        });
        return;
      }
      startApply(card);
    },
    [isAuthenticated, openAuthModalWithAction, startApply]
  );

  return { handleApplyNow };
}
