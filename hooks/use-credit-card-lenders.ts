'use client';

/**
 * Fetches credit-card lenders on mount and maps them to display offers.
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchCreditCardLenders } from '@/lib/api/credit-card-service';
import { mapCreditCardLendersToOffers } from '@/lib/utils/credit-card-lenders';
import type { CreditCardOffer } from '@/types/credit-card';

export type CreditCardLendersStatus = 'loading' | 'empty' | 'error' | 'success';

interface UseCreditCardLendersReturn {
  offers: CreditCardOffer[];
  status: CreditCardLendersStatus;
  refetch: () => Promise<void>;
}

/**
 * Loads credit card offers for the credit-cards page (guest-accessible).
 */
export function useCreditCardLenders(): UseCreditCardLendersReturn {
  const [offers, setOffers] = useState<CreditCardOffer[]>([]);
  const [status, setStatus] = useState<CreditCardLendersStatus>('loading');

  const fetchOffers = useCallback(async (): Promise<void> => {
    setStatus('loading');
    try {
      const response = await fetchCreditCardLenders();
      const mappedOffers = mapCreditCardLendersToOffers(response.lenders ?? []);
      setOffers(mappedOffers);
      if (mappedOffers.length === 0) {
        setStatus('empty');
        return;
      }
      setStatus('success');
    } catch {
      setOffers([]);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void fetchOffers();
  }, [fetchOffers]);

  return {
    offers,
    status,
    refetch: fetchOffers,
  };
}
