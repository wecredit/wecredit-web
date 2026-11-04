'use client';

/**
 * After Apply Now + login: check get-creditcard-lead.
 * Existing details → creditcard-redirect-url (fallback: get-lenders utmLink).
 * No details → form → credit-card-lead → creditcard-redirect-url.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import {
  fetchCreditCardLeadStatus,
  resolveCreditCardPartnerRedirect,
} from '@/lib/api/credit-card-service';
import { isAbortError } from '@/lib/utils/error-helpers';
import { redirectToCreditCardUtmLink } from '@/lib/utils/credit-card-lenders';
import { useLoadingStore } from '@/stores/loading-store';
import { useCreditCardApplyStore } from '@/stores/credit-card-apply-store';
import { LoadingScreen } from '@/components/shared/loading-screen';
import CreditCardForm from './credit-card-form';

type CreditCardApplyModalStatus = 'checking' | 'form';

const CreditCardApplyModal = (): React.ReactNode => {
  const { selectedOffer, isModalOpen, closeApply } = useCreditCardApplyStore();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [status, setStatus] = useState<CreditCardApplyModalStatus>('checking');
  const checkedOfferIdRef = useRef<string | null>(null);
  const redirectAbortRef = useRef<AbortController | null>(null);
  useBodyScrollLock(isModalOpen);

  const openPartnerRedirectAndClose = useCallback(async (): Promise<void> => {
    const offer = useCreditCardApplyStore.getState().selectedOffer;
    if (!offer) {
      return;
    }
    redirectAbortRef.current?.abort();
    const controller = new AbortController();
    redirectAbortRef.current = controller;
    showLoading({
      message: 'Redirecting you to the bank...',
      subtext: 'Please wait while we prepare your application link.',
    });
    try {
      const result = await resolveCreditCardPartnerRedirect(
        offer.name,
        offer.link,
        controller.signal
      );
      if (controller.signal.aborted) {
        return;
      }
      if ('error' in result) {
        toast.error(result.error, {
          description: 'Unable to continue your credit card application.',
        });
        closeApply();
        return;
      }
      closeApply();
      redirectToCreditCardUtmLink(result.redirectUrl);
    } finally {
      if (!controller.signal.aborted) {
        hideLoading();
      }
    }
  }, [closeApply, hideLoading, showLoading]);

  useEffect(() => {
    if (!isModalOpen || !selectedOffer) {
      checkedOfferIdRef.current = null;
      return;
    }
    if (checkedOfferIdRef.current === selectedOffer.id) {
      return;
    }
    checkedOfferIdRef.current = selectedOffer.id;
    setStatus('checking');
    const controller = new AbortController();
    const offerName = selectedOffer.name;
    const runCheck = async (): Promise<void> => {
      showLoading({
        message: 'Checking your details...',
        subtext: 'Please wait while we fetch your credit card profile.',
      });
      try {
        const result = await fetchCreditCardLeadStatus(offerName, controller.signal);
        if (controller.signal.aborted) {
          return;
        }
        if (result.hasExistingLead) {
          hideLoading();
          await openPartnerRedirectAndClose();
          return;
        }
        setStatus('form');
      } catch (error) {
        if (isAbortError(error)) {
          return;
        }
        setStatus('form');
      } finally {
        hideLoading();
      }
    };
    void runCheck();
    return () => {
      controller.abort();
      redirectAbortRef.current?.abort();
      hideLoading();
    };
  }, [
    hideLoading,
    isModalOpen,
    openPartnerRedirectAndClose,
    selectedOffer,
    showLoading,
  ]);

  if (!isModalOpen || !selectedOffer) {
    return null;
  }

  let content: React.ReactNode;
  if (status === 'checking') {
    content = <LoadingScreen />;
  } else {
    content = (
      <CreditCardForm
        creditCardName={selectedOffer.name}
        creditCardTitle={selectedOffer.title}
        onClose={closeApply}
        onSuccess={openPartnerRedirectAndClose}
        isModal
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">{content}</div>
  );
};

export default CreditCardApplyModal;
