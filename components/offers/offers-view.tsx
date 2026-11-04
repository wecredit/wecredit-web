'use client';

import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { newPLEnabled, useOffers } from '@/hooks/use-offers';
import { useAutoUpswingRedirectAfterLntLead } from '@/hooks/use-auto-upswing-redirect-after-lnt-lead';
import { useMemo, useEffect, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  buildOffersPathClearingLenderFilter,
  buildOffersPathWithQuery,
} from '@/lib/utils/offers-navigation';

import {
  OfferCard,
  ErrorState,
  PollingState,
  EmptyState,
  RecentlyClickedOffersCarousel,
} from '@/components/offers';
import { UnmatchedOffersSection } from './unmatched-offers-section';
import type { LenderOfferStatus } from '@/types/wecredit';
import { forwardLenderRedirectByPhone, forwardUpswingRedirect, updateUtmClicked } from '@/lib/api/wecredit';
import { LNT_LENDER_NAME, STORAGE_AUTH_TOKEN, STORAGE_MOBILE } from '@/lib/constants/api-keys';
import { ActionButton, PageHeader } from '@/components/shared';
import { useOfferStore } from '@/stores/offer-store';
import { useLoanApplicationStore } from '@/stores/loan-application-store';
import { isFederationBank, isLnt, isUpswingRedirectAllowed, isZapcash, mapingLenderNameToLenderCode, parseAmountToNumber } from '@/lib/utils/common-helper';
import { useInfoSearchParams } from '@/hooks/use-info-search-params';
import { useUrlParamsStore } from '@/stores/url-params-store';
import { pushOfferpageEvent } from '@/lib/gtm';
import { cn } from '@/lib/utils';
import { useFederationBankRedirect } from '@/hooks/use-federation-bank-redirect';
import { FederationBankRedirectOverlay } from '@/components/offers/federation-bank-redirect-overlay';
import { useZapcashSsoRedirect } from '@/hooks/use-zapcash-sso-redirect';
import { ZapcashSsoRedirectOverlay } from '@/components/offers/zapcash-sso-redirect-overlay';

const OFFER_CONTENT_STATUS = {
  ALL_OFFERS: 'all-offers',
  EMPTY: 'empty',
  REDIRECTING_SINGLE_LENDER: 'redirecting-single-lender',
  SINGLE_LENDER_EMPTY: 'single-lender-empty',
  SINGLE_LENDER_OFFERS: 'single-lender-offers',
} as const;

const resolveOfferContentStatus = (
  lenderNameParam: string,
  singleLenderHasNonInitiatedOffer: boolean,
  filteredExploreOffersCount: number,
  hasOffers: boolean,
) => {
  if (lenderNameParam && singleLenderHasNonInitiatedOffer) {
    return OFFER_CONTENT_STATUS.REDIRECTING_SINGLE_LENDER;
  }

  if (lenderNameParam && filteredExploreOffersCount > 0) {
    return OFFER_CONTENT_STATUS.SINGLE_LENDER_OFFERS;
  }

  if (lenderNameParam) {
    return OFFER_CONTENT_STATUS.SINGLE_LENDER_EMPTY;
  }

  if (!hasOffers) {
    return OFFER_CONTENT_STATUS.EMPTY;
  }

  return OFFER_CONTENT_STATUS.ALL_OFFERS;
};

export const OffersView = () => {
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
  const { triggerApplyFlow } = useLoanApplicationStore();
  const reset = useOfferStore((state) => state.reset);
  const declaredSalary = useOfferStore((state) => state.declaredSalary);
  const empType = useOfferStore((state) => state.empType);
  const requiredLoanAmount = useOfferStore((state) => state.requiredLoanAmount);
  const searchParams = useSearchParams();
  const { partner } = useUrlParamsStore()
  const rawLender =
    searchParams.get('lenderName') ??
    searchParams.get('lendername') ??
    '';

  const isLntLender = rawLender.toLowerCase() === 'lnt';
  const isBasicHomeLoanLender = rawLender.toLowerCase() === 'basichomeloan';
  const isLntLenderOrUpswignLntLender = isLntLender || rawLender.toLowerCase() === 'upswing_lnt';
  const { isAffiliate } = useInfoSearchParams();
  // Affiliate and scoped lender flows should not offer navigation to other lenders.
  const canExploreOtherOffers = !isAffiliate && !isLntLender && !isBasicHomeLoanLender;
  const lenderNameParam = (rawLender);
  const lenderNameParamPollMessage = mapingLenderNameToLenderCode(rawLender);
  const hasFiredOfferpageEventRef = useRef(false);

  const noOffersMessage = isBasicHomeLoanLender ? 'Our executive will contact you shortly' : 'No offers available from this lender';
  
  const pollingMessage = lenderNameParamPollMessage
    ? `Please wait while we fetch offer from ${lenderNameParamPollMessage.charAt(0).toUpperCase() + lenderNameParamPollMessage.slice(1)} for you.`
    : 'Please wait while we fetch the best offers for you.';

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);
  const {
    exploreOffers,
    isLoading,
    isPolling,
    error,
    fetchOffers,
    statusOffers,
    unmatchedOffers,
    isReHitting,
    shouldTriggerApply,
    reHitLenders,
    canReHit,
  } = useOffers();

  // Memoized filtered offers for lenderName(single Lender flow having both explore and status offers for deciding whether lenerName in URL has non-INITIATED offer or not. To decide the redirection to status page using singleLenderHasNonInitiatedOffer)
  const filteredExploreOffers = useMemo(() => {
    if (!lenderNameParam) return exploreOffers;
    return [...exploreOffers, ...statusOffers].filter(
      (offer) => offer.lenderName?.toLowerCase() === lenderNameParam.toLowerCase()
    );
  }, [exploreOffers, statusOffers, lenderNameParam]);

  // Memoized check for single lender non-initiated offer
  const singleLenderHasNonInitiatedOffer = useMemo(
    () =>
      Boolean(
        lenderNameParam &&
        filteredExploreOffers.length === 1 &&
        filteredExploreOffers[0].wcStatus !== 'INITIATED',
      ),
    [lenderNameParam, filteredExploreOffers],
  );

  useEffect(() => {
    // If partner is present, don't trigger apply flow
    if (partner) return;

    if (!shouldTriggerApply) return;

    // PersonalLoanContent is now mounted via the offers layout, so we can
    // trigger the apply flow directly without navigating to the home page.
    triggerApplyFlow();
  }, [shouldTriggerApply, triggerApplyFlow]);

  // If lenderName is present and the matching offer is non-INITIATED, redirect to status page
  useEffect(() => {
    if (!lenderNameParam) return;
    if (singleLenderHasNonInitiatedOffer) {
      router.replace(buildOffersPathWithQuery('/offers/status', searchParams));
    }
  }, [lenderNameParam, singleLenderHasNonInitiatedOffer, router, searchParams]);

  useAutoUpswingRedirectAfterLntLead({
    isLntOrUpswingLntUrlLender: isLntLenderOrUpswignLntLender,
    isLoading,
    isReHitting,
    isPolling,
    error,
    singleLenderHasNonInitiatedOffer,
    filteredExploreOffers,
  });

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

  const handleOfferClick = (offer: LenderOfferStatus): void => {
    const offerLenderName = offer.lenderName?.toLowerCase();
    const isUpswingRedirectAllowedLender = isUpswingRedirectAllowed(offerLenderName);
    const isFederationBankLender = isFederationBank(offerLenderName);
    const isZapcashLender = isZapcash(offerLenderName);
    // For non-INITIATED offers in explore screen, navigate to status page
    if (offer.wcStatus !== 'INITIATED') {
      router.push(buildOffersPathWithQuery('/offers/status', searchParams));
      return;
    }

    const lenderName: string = offer.lenderName || '';
    const mobile: string | undefined = getCookie(STORAGE_MOBILE) as string | undefined;
    const token: string | undefined = getCookie(STORAGE_AUTH_TOKEN) as string | undefined;

    if (!mobile) {
      return;
    }

    if (isFederationBankLender) {
      void handleFederationBankRedirect();
      return;
    }

    if (isZapcashLender) {
      void handleZapcashSsoRedirect();
      return;
    }

    // LNT & Upswing LNT special flow
    if (isLnt(offerLenderName)) {
      void forwardLenderRedirectByPhone(mobile, LNT_LENDER_NAME, token);
      return;
    }

    // For INITIATED offers, open UTM link
    const utmLink: string | undefined = offer.utmLink;
    if (!utmLink) {
      return;
    }
    if (isUpswingRedirectAllowedLender) {
      void forwardUpswingRedirect(mobile, token, utmLink);
      return;
    }


    // Update UTM clicked status
    if (lenderName && mobile) {
      void updateUtmClicked(mobile, lenderName, token);
    }

    window.open(utmLink, '_blank');

    // Refresh offers after 2 seconds to reflect status change
    setTimeout(() => {
      fetchOffers();
    }, 2000);
  };

  const handleRecentlyClickedOfferClick = (offer: LenderOfferStatus): void => {
    // For recently clicked offers, navigate to status page
    router.replace(buildOffersPathWithQuery('/offers/status', searchParams));
  };
  const handleCheckStatus = (): void => {
    router.replace(buildOffersPathWithQuery('/offers/status', searchParams));
  };
  const handleGoBack = (): void => {
    router.push('/');
  };
  // Includes explore + recently-clicked + API unmatched so we never show an empty shell when only unmatched exist
  const totalOffers = statusOffers.length + exploreOffers.length;
  const hasOffers = totalOffers > 0 || unmatchedOffers.length > 0;
  const hasInitiatedOffers = exploreOffers.length > 0;
  const maxInitiatedAmount = useMemo(() => {
    // Find the maximum uptoAmount from INITIATED offers, optionally filtered by lenderName
    return exploreOffers
      .filter((offer) => lenderNameParam ? (offer.lenderName === lenderNameParam && offer.wcStatus === 'INITIATED') : (offer.wcStatus === 'INITIATED') && offer.uptoAmount)
      .map((offer) => parseAmountToNumber(offer.uptoAmount))
      .reduce((max, current) => Math.max(max, current), 0);
  }, [exploreOffers, lenderNameParam]);
  const formattedMaxAmount = useMemo(() => {
    return maxInitiatedAmount > 0
      ? `₹${maxInitiatedAmount.toLocaleString('en-IN')}`
      : null;
  }, [maxInitiatedAmount]);

  useEffect(() => {
    if (isLoading || isPolling || isReHitting || hasFiredOfferpageEventRef.current) {
      return;
    }

    // In lender-filtered flows, we only report cards for the selected lender.
    const sourceOffers = lenderNameParam ? filteredExploreOffers : exploreOffers;
    const lenderNames = Array.from(
      new Set(
        sourceOffers
          .map((offer) => offer.lenderName?.trim())
          .filter((lenderName): lenderName is string => Boolean(lenderName))
      )
    );

    pushOfferpageEvent({
      offerList: lenderNames,
      maxLoanAmount: maxInitiatedAmount,
      declaredSalary,
      requiredLoanAmount,
      empType,
    });
    hasFiredOfferpageEventRef.current = true;
  }, [
    lenderNameParam,
    filteredExploreOffers,
    exploreOffers,
    isLoading,
    isPolling,
    isReHitting,
    maxInitiatedAmount,
    declaredSalary,
    requiredLoanAmount,
    empType,
  ]);
  // Only show the status CTA once we have non-initiated offers to check.
  // const hasStatusOffers = statusOffers.length > 0;
  const hasStatusOffers = statusOffers.length > 0;
  const showPolling = isPolling && !hasOffers;
  const showEmpty = !isPolling && !hasOffers;
  const renderOfferSection = (title: string, offerList: LenderOfferStatus[]) => {
    if (offerList.length === 0) {
      return null;
    }
    return (
      <section className="space-y-3">
        <h2 className="lead-form-label">{title}</h2>
        <div className="space-y-4">
          {offerList.map((offer, index) => (
            <OfferCard
              key={`${offer.lenderName}-${index}`}
              offer={offer}
              onClick={() => handleOfferClick(offer)}
              variant="explore"
            />
          ))}
        </div>
      </section>
    );
  };

  /**
   * Main explore area: either filtered by `lenderName` in the URL, or the default multi-lender list.
   * Non-initiated single-lender case is handled by redirect; we render nothing here while that runs.
   */
  const renderMainOffersContent = (): ReactNode => {
    const offerContentStatus = resolveOfferContentStatus(
      lenderNameParam,
      singleLenderHasNonInitiatedOffer,
      filteredExploreOffers.length,
      hasOffers,
    );

    if (
      offerContentStatus === OFFER_CONTENT_STATUS.REDIRECTING_SINGLE_LENDER ||
      offerContentStatus === OFFER_CONTENT_STATUS.EMPTY
    ) {
      return null;
    }

    if (offerContentStatus === OFFER_CONTENT_STATUS.SINGLE_LENDER_OFFERS) {
      let exploreOtherOffersContent: ReactNode = null;

      if (canExploreOtherOffers) {
        exploreOtherOffersContent = (
          <>
            <p className="text-[14px] text-gray-600">
              More lenders might have exciting offers waiting for you. Take a moment to explore your options.
            </p>
            <div className="flex justify-center w-full">
              <ActionButton
                type="button"
                onClick={handleExploreMore}
                className="w-[200px] px-10"
                rightIcon="🔍"
                isLoading={isReHitting}
                disabled={isReHitting}
              >
                Explore More Offers
              </ActionButton>
            </div>
          </>
        );
      }

      return (
        <div className="space-y-6 max-w-xl mx-auto">
          {renderOfferSection('', filteredExploreOffers)}
          {exploreOtherOffersContent}
        </div>
      );
    }

    if (offerContentStatus === OFFER_CONTENT_STATUS.SINGLE_LENDER_EMPTY) {
      let exploreOtherOffersButton: ReactNode = null;

      if (canExploreOtherOffers) {
        exploreOtherOffersButton = (
          <ActionButton
            type="button"
            onClick={handleExploreMore}
            className="w-full max-w-xs"
            isLoading={isReHitting}
            disabled={isReHitting}
          >
            Explore Other Offers
          </ActionButton>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center text-center">
          <EmptyState title={noOffersMessage} description=" " />
          {exploreOtherOffersButton}
        </div>
      );
    }

    let offerSection: ReactNode = null;
    let exploreMoreButton: ReactNode = null;
    let unmatchedOffersSection: ReactNode = null;

    if (exploreOffers.length > 0) {
      offerSection = renderOfferSection('', exploreOffers);
    }

    if (canReHit && newPLEnabled) {
      exploreMoreButton = (
        <ActionButton
          type="button"
          onClick={handleExploreMore}
          rightIcon="🔍"
          fullWidth
          isLoading={isReHitting}
          disabled={isReHitting}
        >
          Explore More Offers
        </ActionButton>
      );
    }

    if (unmatchedOffers.length > 0) {
      unmatchedOffersSection = <UnmatchedOffersSection offers={unmatchedOffers} />;
    }

    return (
      <div className={cn("space-y-6 max-w-xl mx-auto", exploreOffers.length <= 0 && "mt-10")}>
        {offerSection}
        {exploreMoreButton}
        {unmatchedOffersSection}
      </div>
    );
  };

  // Show loading skeleton only during initial load; re-hitting is button-level loading only
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <PollingState message={pollingMessage} />
      </div>
    );
  }

  else if (isPolling) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {lenderNameParam ? (
          <PollingState message={pollingMessage} />
        ) : (
          <PollingState />
        )}
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

  // Only redirect if polling has completed and there are no explore offers
  // This allows polling to complete before redirecting to status page
  // if (!isPolling && exploreOffers.length === 0) {
  //   redirect('/offers/status');
  // }

  const recentStatusOffers = newPLEnabled ? statusOffers : statusOffers.filter((offer) => offer.isWebHookSent !== 2);

  return (
    <div className="min-h-screen ">
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
      <PageHeader title="Offers for you" onBack={handleGoBack} />

      {/* Recently Clicked Offers Carousel - At the top */}
      {/*// Show carousel if there are status offers and no lender filter is applied (to avoid confusion in single lender view)*/}
      {/* Recently Clicked Offers Carousel - At the top */}
      {/* Show carousel only if there are non-webhook status offers and no lender filter */}
      {recentStatusOffers.length > 0 && !lenderNameParam && (
        <RecentlyClickedOffersCarousel
          offers={recentStatusOffers}
          onOfferClick={handleRecentlyClickedOfferClick}
        />
      )}

      {/* Congratulations message */}
      {!singleLenderHasNonInitiatedOffer && filteredExploreOffers.length > 0 && hasInitiatedOffers && formattedMaxAmount && (
        <div className="px-4 pb-4 pt-2">
          <p
            className="text-blue-600 pt-2 max-w-xl mx-auto"
            style={{
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '153%',
              letterSpacing: '-0.01em',
            }}
          > Congratulations! You are eligible for a loan of upto {formattedMaxAmount} {lenderNameParam ? `from ${lenderNameParam.charAt(0).toUpperCase() + lenderNameParam.slice(1)}` : ''}
          </p>
        </div>
      )}


      <div className="px-4 pb-4">
        {showPolling && <PollingState />}
        <div className="flex flex-col items-start justify-center text-center py-0 space-y-0">
          {!lenderNameParam && showEmpty && <EmptyState />}
        </div>
        {renderMainOffersContent()}
      </div>
      {hasStatusOffers && !lenderNameParam && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t shadow-lg z-10">
          <ActionButton
            type="button"
            onClick={handleCheckStatus}
            fullWidth
            className="h-14 text-base font-medium max-w-xl mx-auto items-center justify-center flex"
          >
            Check your Loan Status
          </ActionButton>
        </div>
      )}
    </div>
  );
};
