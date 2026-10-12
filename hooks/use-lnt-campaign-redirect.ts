'use client';

/**
 * Custom hook to manage direct L&T redirection on campaign/single-lender landing pages.
 * Bypasses lead forms and immediately calls forwardLenderRedirectByPhone once mobile is available.
 */

import { useEffect, useRef, useState } from 'react';
import { getCookie } from 'cookies-next';
import { toast } from 'sonner';
import { forwardLenderRedirectByPhone } from '@/lib/api/wecredit';
import {
  LNT_LENDER_NAME,
  STORAGE_AUTH_TOKEN,
  STORAGE_MOBILE,
} from '@/lib/constants/api-keys';
import { isLnt } from '@/lib/utils/common-helper';

export interface UseLntCampaignRedirectParams {
  lenderName: string;
  isLoading: boolean;
  error: unknown;
  canonicalLenderName: string | null;
  mobile: string | null;
  isAuthenticated: boolean;
  userPhone?: string;
}

export interface UseLntCampaignRedirectReturn {
  isLntLender: boolean;
  lntRedirectError: string | null;
}

export function useLntCampaignRedirect({
  lenderName,
  isLoading,
  error,
  canonicalLenderName,
  mobile,
  isAuthenticated,
  userPhone,
}: UseLntCampaignRedirectParams): UseLntCampaignRedirectReturn {
  const isLntLender = isLnt(lenderName);
  const [lntRedirectError, setLntRedirectError] = useState<string | null>(null);
  const hasFiredLntRedirectRef = useRef(false);

  useEffect(() => {
    if (!isLntLender) return;
    if (isLoading || error || !canonicalLenderName) return;

    const cookieMobile = getCookie(STORAGE_MOBILE) as string | undefined;
    const cleanedUserPhone = userPhone ? userPhone.replace(/\D/g, '') : undefined;
    const effectiveMobile = mobile || cookieMobile || cleanedUserPhone;

    if (!effectiveMobile || (!isAuthenticated && !mobile)) {
      return;
    }

    if (hasFiredLntRedirectRef.current) return;
    hasFiredLntRedirectRef.current = true;

    setLntRedirectError(null);

    const runRedirect = async () => {
      try {
        const token = getCookie(STORAGE_AUTH_TOKEN) as string | undefined;
        const result = await forwardLenderRedirectByPhone(
          effectiveMobile,
          LNT_LENDER_NAME,
          token
        );
        if (!result.success) {
          const message =
            result.error || 'Unable to start your journey. Please try again.';
          setLntRedirectError(message);
          toast.error(message);
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Something went wrong while processing your request.';
        setLntRedirectError(message);
        toast.error(message);
      }
    };

    void runRedirect();
  }, [
    isLntLender,
    isLoading,
    error,
    canonicalLenderName,
    mobile,
    isAuthenticated,
    userPhone,
  ]);

  return { isLntLender, lntRedirectError };
}
