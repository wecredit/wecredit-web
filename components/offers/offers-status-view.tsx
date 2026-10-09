'use client';

import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { newPLEnabled, useOffers } from '@/hooks/use-offers';
import {
  OfferCard,
  OffersLoadingSkeleton,
  ErrorState,
  EmptyState,
  OffersHero,
} from '@/components/offers';
import type { LenderOfferStatus } from '@/types/wecredit';
import { forwardLenderRedirectByPhone, updateUtmClicked } from '@/lib/api/wecredit';
import { notifyForwardNavigationEvent } from '@/lib/api/upswing-navigation-event';
import { LNT_LENDER_NAME, STORAGE_AUTH_TOKEN, STORAGE_MOBILE } from '@/lib/constants/api-keys';
import { ActionButton, PageHeader } from '@/components/shared';
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLoanApplicationStore } from '@/stores/loan-application-store';
import { buildOffersPathClearingLenderFilter, buildOffersPathWithQuery } from '@/lib/utils/offers-navigation';
import { useUrlParamsStore } from '@/stores/url-params-store';
import { isFederationBank, isLnt, isZapcash } from '@/lib/utils/common-helper';
import { useFederationBankRedirect } from '@/hooks/use-federation-bank-redirect';
import { FederationBankRedirectOverlay } from '@/components/offers/federation-bank-redirect-overlay';
import { useZapcashSsoRedirect } from '@/hooks/use-zapcash-sso-redirect';
import { ZapcashSsoRedirectOverlay } from '@/components/offers/zapcash-sso-redirect-overlay';


/**
 * Offers Status View Component
 * Displays non-INITIATED offers in Status section
 */
export const OffersStatusView = () => {
  const router = useRouter();
  const {
    redirectState,
    errorMessage,
    handleFederationBankRedirect,
    dismissFederationBankRedirect,
  } = useFederationBankRedirect();
  const {
    redirectState: zapcashRedirectState,
    errorMessage: zapcashErrorMessage,
    handleZapcashSsoRedirect,
    dismissZapcashSsoRedirect,
  } = useZapcashSsoRedirect();
const {partner} = useUrlParamsStore()
  const searchParams = useSearchParams();
  const { statusOffers, isLoading, error, fetchOffers, shouldTriggerApply, reHitLenders, isReHitting } = useOffers();
 const { triggerApplyFlow } = useLoanApplicationStore();
const hasTriggeredRef = useRef(false);

useEffect(() => {
  if (partner) return;
  if (!shouldTriggerApply) return;
  if (hasTriggeredRef.current) return;

  hasTriggeredRef.current = true;

  // PersonalLoanContent is now mounted via the offers layout, so we can
  // trigger the apply flow directly without navigating to the home page.
  triggerApplyFlow();
}, [shouldTriggerApply, triggerApplyFlow]);


  const handleOfferClick = (offer: LenderOfferStatus): void => {
    const utmLink: string | undefined = offer.utmLink;
    const offerLenderName = offer.lenderName?.toLowerCase();
    const isFederationBankLender = isFederationBank(offerLenderName || '');
    const isZapcashLender = isZapcash(offerLenderName || '');
    const isLntOffer = isLnt(offerLenderName);
    const mobile: string | undefined = getCookie(STORAGE_MOBILE) as string | undefined;
    const token: string | undefined = getCookie(STORAGE_AUTH_TOKEN) as string | undefined;

    if (isFederationBankLender) {
      void handleFederationBankRedirect();
      return;
    }

    if (isZapcashLender) {
      void handleZapcashSsoRedirect();
      return;
    }

    if (isLntOffer) {
      if (mobile) {
        void forwardLenderRedirectByPhone(mobile, LNT_LENDER_NAME, token);
      }
      return;
    }

    if (!utmLink) {
      return;
    }
    const lenderName: string = offer.lenderName || '';
    const isUtmClicked: boolean = offer.wcStatus === 'UTM_CLICKED';

    if (lenderName && mobile && !isUtmClicked) {
      //void updateUtmClicked(mobile, lenderName, token);
    }

    window.open(utmLink, '_blank'); 

    setTimeout(() => {
      fetchOffers();
    }, 3000); // 3 seconds
  };

  const hasStatusOffers = statusOffers.length > 0;
  const handleExploreMore = async () => {
    if (newPLEnabled) {
      const { shouldOpenLeadForm } = await reHitLenders();

      // Non-WeCredit data: open multi-lender lead form in place.
      // PersonalLoanContent is mounted via the offers layout so triggerApplyFlow
      // works here without navigating away.
      if (shouldOpenLeadForm) {
        triggerApplyFlow();
        return;
      }
    }
    router.replace(buildOffersPathClearingLenderFilter(searchParams));
  };

  const handleGoBack = () => {
    router.push(buildOffersPathWithQuery('/offers',searchParams));
  };
  
  const renderOfferSection = (title: string, offerList: LenderOfferStatus[]) => {
    if (offerList.length === 0) {
      return null;
    }
    return (
      <section className="space-y-3">
        <div className="space-y-4">
          {offerList.map((offer, index) => (
            <OfferCard
              key={`${offer.lenderName}-${index}`}
              offer={offer}
              onClick={() => handleOfferClick(offer)}
              variant="status"
            />
          ))}
        </div>
      </section>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 max-w-xl mx-auto">
        <OffersLoadingSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorState error={error} onRetry={fetchOffers} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <FederationBankRedirectOverlay
        state={redirectState}
        errorMessage={errorMessage}
        onDismiss={dismissFederationBankRedirect}
      />
      <ZapcashSsoRedirectOverlay
        state={zapcashRedirectState}
        errorMessage={zapcashErrorMessage}
        onDismiss={dismissZapcashSsoRedirect}
      />
      <PageHeader title="Loan Status"  isOfferStatus={true} onBack={handleGoBack} />
      {hasStatusOffers && <OffersHero eligibleAmount="₹1,00,000" offerCount={statusOffers.length} />}

      <div className="px-4 pb-4 max-w-xl mx-auto">
        {!hasStatusOffers ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-center">
            <EmptyState 
              title="No active applications" 
              description="You haven't applied for any loans yet. Go back to explore offers."
            />
            <ActionButton
                  type="button"
                  onClick={handleExploreMore}
                  className="w-full max-w-xs"
                  isLoading={isReHitting}
                  disabled={isReHitting}
                >
                  Explore Other Offers
                </ActionButton>
          </div>
        ) : (
          <div className="space-y-6">
            {renderOfferSection('Check loan status', statusOffers)}
          </div>
        )}
      </div>
    </div>
  );
};
