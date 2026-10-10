'use client';

/**
 * When the offers URL is single-lender L&T or Upswing L&T (`lenderName=lnt|upswing_lnt`)—including
 * post–create-lead (`newLead=true`) or a direct visit like `/offers?lenderName=lnt`—this hook waits
 * until loading/polling settles, then runs `forwardUpswingRedirect` once if an INITIATED Upswing-eligible
 * row exists. Same outcome as tapping the offer card, without requiring a tap.
 *
 * Keep logic here so `OffersView` stays presentational and this flow can be reused or tested in isolation.
 */

import { getCookie } from 'cookies-next';
import { useEffect, useRef } from 'react';
import { forwardLenderRedirectByPhone, forwardUpswingRedirect } from '@/lib/api/wecredit';
import { LNT_LENDER_NAME, STORAGE_AUTH_TOKEN, STORAGE_MOBILE } from '@/lib/constants/api-keys';
import { isLnt, isUpswingRedirectAllowed } from '@/lib/utils/common-helper';
import type { LenderOfferStatus } from '@/types/wecredit';

export type UseAutoUpswingRedirectAfterLntLeadParams = {
  /** True when `lenderName` in the URL is L&T or Upswing L&T (covers create-lead navigation and deep links). */
  isLntOrUpswingLntUrlLender: boolean;
  isLoading: boolean;
  isReHitting: boolean;
  isPolling: boolean;
  error: string | null;
  /** When true, the parent already redirects to `/offers/status`; do not start Upswing here. */
  singleLenderHasNonInitiatedOffer: boolean;
  /** Same list used to render single-lender cards (explore + status merged when filtered). */
  filteredExploreOffers: LenderOfferStatus[];
};

/**
 * Side-effect only: may assign `window.location` via `forwardUpswingRedirect` on success.
 */
export const useAutoUpswingRedirectAfterLntLead = (
  params: UseAutoUpswingRedirectAfterLntLeadParams,
): void => {
  const {
    isLntOrUpswingLntUrlLender,
    isLoading,
    isReHitting,
    isPolling,
    error,
    singleLenderHasNonInitiatedOffer,
    filteredExploreOffers,
  } = params;

  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!isLntOrUpswingLntUrlLender) return;
    if (isLoading || isReHitting || isPolling) return;
    if (error) return;
    if (singleLenderHasNonInitiatedOffer) return;
    if (hasFiredRef.current) return;

    const mobile = getCookie(STORAGE_MOBILE) as string | undefined;
    if (!mobile) return;

    const offer = filteredExploreOffers.find(
      (o) =>
        o.wcStatus === 'INITIATED' &&
        isUpswingRedirectAllowed(o.lenderName?.toLowerCase() ?? ''),
    );
    if (!offer) return;

    hasFiredRef.current = true;
    const token = getCookie(STORAGE_AUTH_TOKEN) as string | undefined;
    if (isLnt(offer.lenderName)) {
      void forwardLenderRedirectByPhone(mobile, LNT_LENDER_NAME, token);
    } else {
      void forwardUpswingRedirect(mobile, token, offer.utmLink);
    }
  }, [
    isLntOrUpswingLntUrlLender,
    isLoading,
    isReHitting,
    isPolling,
    error,
    singleLenderHasNonInitiatedOffer,
    filteredExploreOffers,
  ]);
};
