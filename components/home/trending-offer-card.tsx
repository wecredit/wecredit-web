'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCookie } from 'cookies-next';
import { PercentIcon, CalendarIcon } from '../icons';
import ArrowBadge from '../ui/arrow-badge';
import { useAuth } from '@/hooks/use-auth';
import { ActionButton } from '../shared';
import { checkStatusAll, forwardLenderRedirectByPhone } from '@/lib/api/wecredit';
import { STORAGE_MOBILE, STORAGE_AUTH_TOKEN, LNT_LENDER_NAME } from '@/lib/constants/api-keys';
import type { LenderOfferStatus, LenderType } from '@/types/wecredit';
import { getAmountUptoLabel } from '@/lib/lender-display';
import { buildInternalLenderNavigationHref } from '@/lib/utils/internal-lender-navigation';
import { isLnt } from '@/lib/utils/common-helper';
import { toast } from 'sonner';

/** Props for TrendingOfferCard component */
interface TrendingOfferCardProps {
  /** Unique identifier (lender ID) */
  id: string;
  /** Lender name */
  lenderName: string;
  /** Lender logo path */
  logoPath?: string;
  /** Badge text (e.g., "Fast Disbursal") */
  badge?: string;
  /** Lender-specific badge background color */
  topColour?: string | null;
  /** Maximum loan amount */
  amount: string;
  /** Interest rate */
  interestRate: string;
  /** Loan tenure */
  tenure: string;
  /** CTA link */
  href: string;
  /** Animation delay index */
  index: number;
  /** Skip animation for carousel scrolling */
  skipAnimation?: boolean;
  /** From API `lenderType`; drives amount-line copy. */
  lenderType?: LenderType | null;
}

/**
 * Trending offer card component
 * Displays lender info with amount, rate, tenure and CTA
 * 
 * Flow (per PDF Step 5 - User Interaction with Trending Offers):
 * - 5A: If user NOT logged in → Show login modal, continue after success
 * - 5B: If user IS logged in → Proceed directly to check eligibility
 */
const TrendingOfferCard = ({
  id,
  lenderName,
  logoPath,
  badge,
  topColour,
  amount,
  interestRate,
  tenure,
  index,
  skipAnimation = false,
  lenderType,
}: TrendingOfferCardProps): React.ReactNode => {
  const amountUptoLabel = getAmountUptoLabel(lenderType);
  /**
   * Validate logo path for Next.js Image.
   * 
   * Next.js tries to construct a URL from the src string, which throws
   * "Failed to construct 'URL': Invalid URL" for values like "N/A" or "--".
   * We only allow:
   * - Absolute URLs (http/https/data)
   * - Root-relative paths (starting with "/")
   */
  const hasValidLogoPath = React.useMemo((): boolean => {
    if (!logoPath || typeof logoPath !== 'string') {
      return false;
    }
    const trimmedPath = logoPath.trim();
    if (trimmedPath === '') {
      return false;
    }
    if (trimmedPath.startsWith('/')) {
      return true;
    }
    if (
      trimmedPath.startsWith('http://') ||
      trimmedPath.startsWith('https://') ||
      trimmedPath.startsWith('data:')
    ) {
      try {
        // Validate that the URL can be constructed successfully.
        // This prevents runtime TypeError from Next/Image internals.
        new URL(trimmedPath);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }, [logoPath]);

  const router = useRouter();
  const { isAuthenticated, openAuthModalWithAction } = useAuth();
  const navigateToLenderForm = useCallback(
    (targetLenderName: string): void => {
      router.push(buildInternalLenderNavigationHref(targetLenderName));
    },
    [router]
  );

  // State for eligibility check loading (UI remains unchanged, only button disabled during check)
  const [isCheckingEligibility, setIsCheckingEligibility] = useState<boolean>(false);

  // Track component mount status to prevent state updates after unmount
  // This prevents memory leaks and React warnings when async operations complete
  const isMountedRef = useRef<boolean>(true);

  // AbortController for canceling API calls on unmount
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount: cancel any pending API calls and mark component as unmounted
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Cancel any pending API request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Find lender in offers array by name (case-insensitive)
   * Returns the first matching lender or null if not found
   * 
   * Edge cases handled:
   * - Empty/null/undefined lenders array
   * - Empty/null/undefined lenderName
   * - Case-insensitive matching for flexibility
   */
  const findLenderInOffers = useCallback(
    (lenders: LenderOfferStatus[], searchName: string): LenderOfferStatus | null => {
      // Guard: Return null if lenders array is empty, null, or undefined
      if (!lenders || lenders.length === 0) {
        return null;
      }

      // Guard: Return null if lenderName is empty, null, or undefined
      if (!searchName || typeof searchName !== 'string') {
        return null;
      }

      // Case-insensitive search: normalize both names to lowercase
      const normalizedSearchName = searchName.toLowerCase().trim();

      // Find first matching lender
      const matchedLender = lenders.find((lender) => {
        // Guard: Skip lenders with missing or invalid lenderName
        if (!lender?.lenderName || typeof lender.lenderName !== 'string') {
          return false;
        }
        return lender.lenderName.toLowerCase().trim() === normalizedSearchName;
      });

      return matchedLender || null;
    },
    []
  );

  /**
   * Handle CTA button click
   * Per PDF Step 5: Check auth status before proceeding
   * 
   * Flow:
   * - If not authenticated: Show login modal
   * - If authenticated: Check eligibility via API
   *   - If lender found in offers: Navigate to offers status page
   *   - If lender not found: Navigate to lender page (normal flow)
   * 
   * Note: UI remains unchanged - card always displays the same content regardless of check result
   */
  const handleCheckEligibility = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>): Promise<void> => {
      e.preventDefault();

      // PDF Step 5A: User Not Logged In → Show login first
      if (!isAuthenticated) {
        openAuthModalWithAction({
          type: 'check_eligibility',
          lenderId: id,
          lenderName,
        });
        return;
      }

      // Guard: Validate lenderName exists before proceeding
      if (!lenderName || typeof lenderName !== 'string') {
        // Fallback: Navigate to normal flow even if lenderName is invalid
        navigateToLenderForm(lenderName || 'unknown');
        return;
      }

      // Guard: Prevent multiple simultaneous API calls (race condition protection)
      if (isCheckingEligibility) {
        return;
      }

      // Get mobile number from cookie - required for API call
      const mobile = getCookie(STORAGE_MOBILE) as string | undefined;

      // Guard: Early return if mobile number is missing
      // This shouldn't happen if user is authenticated, but we guard against it
      if (!mobile || typeof mobile !== 'string') {
        console.warn('[TrendingOfferCard] Mobile number not found, falling back to normal navigation');
        // Fallback: Allow normal navigation flow instead of blocking user
        navigateToLenderForm(lenderName);
        return;
      }

      // Get auth token (optional, can be undefined)
      const token = getCookie(STORAGE_AUTH_TOKEN) as string | undefined;

      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Set loading state only if component is still mounted
      // This disables the button during check but doesn't change card UI
      if (isMountedRef.current) {
        setIsCheckingEligibility(true);
      }

      // L&T direct redirect
      const isLntCard = isLnt(id) || isLnt(lenderName);
      if (isLntCard) {
        try {
          const result = await forwardLenderRedirectByPhone(
            mobile,
            LNT_LENDER_NAME,
            token,
            abortController.signal,
          );
          if (!result.success && isMountedRef.current) {
            setIsCheckingEligibility(false);
            toast.error(result.error || 'Unable to connect to lender. Please try again.');
          }
        } catch (err) {
          if (isMountedRef.current) {
            setIsCheckingEligibility(false);
            if (err instanceof Error && err.name === 'AbortError') {
              return;
            }
            const msg =
              err instanceof Error
                ? err.message
                : 'Something went wrong while processing your request.';
            toast.error(msg);
          }
        } finally {
          abortControllerRef.current = null;
        }
        return;
      }

      try {
        // Call check-status-all API to get user's existing offers
        const result = await checkStatusAll(mobile, token, abortController.signal);

        // Guard: Check if component is still mounted before updating state
        // Prevents "Can't perform a React state update on an unmounted component" warning
        if (!isMountedRef.current) {
          return;
        }

        // Handle API error response
        if (!result.success || !result.data) {
          setIsCheckingEligibility(false);
          // Fallback: Don't block user - allow normal navigation
          navigateToLenderForm(lenderName);
          return;
        }

        // Guard: Validate response data structure
        const { lenders } = result.data;
        if (!lenders || !Array.isArray(lenders)) {
          console.warn('[TrendingOfferCard] Invalid lenders array in API response');
          setIsCheckingEligibility(false);
          // Fallback: Navigate normally if response structure is invalid
          navigateToLenderForm(lenderName);
          return;
        }

        // Search for current lender in the offers list
        const matchedLender = findLenderInOffers(lenders, lenderName);

        // Reset loading state before navigation
        setIsCheckingEligibility(false);

        if (matchedLender) {
          // Lender found: User is already a lead for this lender
          // Navigate to offers status page instead of lender form, always with lenderName in query
          router.push(`/offers/?lenderName=${encodeURIComponent(lenderName)}`);
        } else {
          // Lender not found: User hasn't applied to this lender yet
          // Proceed with normal flow (navigate to lender page)
          navigateToLenderForm(lenderName);
        }
      } catch (error) {
        // Guard: Only update state if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        // Handle AbortError (request was cancelled, e.g., on unmount)
        if (error instanceof Error && error.name === 'AbortError') {
          // Don't update state for aborted requests - component may be unmounting
          return;
        }

        setIsCheckingEligibility(false);

        // Fallback: Never block user - allow normal navigation on error
        navigateToLenderForm(lenderName);
      } finally {
        // Cleanup: Reset loading state if component is still mounted
        if (isMountedRef.current) {
          // Loading state is already reset in success/error paths above
          // This is a safety net in case of unexpected code paths
          abortControllerRef.current = null;
        }
      }
    },
    [
      isAuthenticated,
      openAuthModalWithAction,
      id,
      lenderName,
      router,
      isCheckingEligibility,
      findLenderInOffers,
      navigateToLenderForm,
    ]
  );


  return (
    <motion.div
      initial={skipAnimation ? false : { opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={skipAnimation ? { duration: 0 } : {
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay: index * 0.1,
      }}
      className="w-full h-full max-w-xl mx-auto"
    >
      {/* Outer white container */}
      <div
        className="relative rounded-lg h-full overflow-hidden bg-white"
        style={{
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Gradient content area */}
        <div
          className="relative pt-2 pl-3 pr-0 pb-2"
          style={{
            background: 'linear-gradient(96.83deg, #CCDFFC 35.72%, #FAFCFF 100%)',
          }}
        >
          {/* Header: Logo + Badge */}
          <div className="flex items-center justify-between mb-1 h-[30px]">
            <div className="w-[80px] h-[30px] flex items-center justify-start overflow-hidden">
              {hasValidLogoPath ? (
                <Image
                  src={logoPath?.trim() ?? ''}
                  alt={lenderName}
                  width={80}
                  height={30}
                  draggable={false}
                  className="max-h-[30px] w-auto object-contain pointer-events-none"
                />
              ) : (
                <span className="font-medium text-sm text-gray-700 truncate w-full">  {lenderName}</span>
              )}
            </div>

            {badge && <ArrowBadge text={badge} backgroundColor={topColour} />}
          </div>



          {/* Card Content - Always shows original offer details (UI unchanged) */}
          <>
            {/* Amount - Italic blue text */}
            <h3 className="font-medium text-sm leading-[120%] mb-2">
              {amountUptoLabel} {amount}
            </h3>

            {/* Rate & Tenure - With proper icons */}
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <PercentIcon />
                <span className="text-gray-500 text-xs font-light leading-none">Int. rate {interestRate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarIcon />
                <span className="text-gray-500 text-xs font-light leading-none">Upto {tenure}</span>
              </div>
            </div>
          </>
        </div>

        {/* CTA Button - On white background outside gradient */}
        {/* Button shows loading state during check, otherwise always "Check Eligibility" */}
        <div className="p-2 bg-[#ECF1FE]">
          <ActionButton
            type="button"
            onClick={handleCheckEligibility}
            disabled={isCheckingEligibility}
            fullWidth
            className="text-xs cursor-pointer font-medium rounded-full py-1 h-6"
          >
            {isCheckingEligibility ? 'Checking...' : 'Check Eligibility'}
          </ActionButton>
        </div>
      </div>
    </motion.div>
  );
};

export default TrendingOfferCard;
