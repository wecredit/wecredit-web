'use client';

/**
 * After Apply Now + login: check get-creditcard-lead.
 * Existing details → creditcard-redirect-url (fallback: get-lenders utmLink).
 * No details → form → credit-card-lead → creditcard-redirect-url.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { useCloseOnBrowserBack } from '@/hooks/use-close-on-browser-back';
import {
  fetchCreditCardLeadStatus,
  resolveCreditCardPartnerRedirect,
} from '@/lib/api/credit-card-service';
import { isAbortError } from '@/lib/utils/error-helpers';
import { redirectToCreditCardUtmLink } from '@/lib/utils/credit-card-lenders';
import { useLoadingStore } from '@/stores/loading-store';
import { useCreditCardApplyStore } from '@/stores/credit-card-apply-store';
import { LoadingScreen } from '@/components/shared/loading-screen';
import { CreditCardRedirectLoading } from '@/components/credit-cards/credit-card-redirect-loading';
import CreditCardForm from './credit-card-form';

type CreditCardApplyModalStatus = 'checking' | 'form';

const CREDIT_CARD_APPLY_MODAL_HISTORY_KEY = 'creditCardApplyModal';

const CreditCardApplyModal = (): React.ReactNode => {
  const { selectedOffer, isModalOpen, closeApply } = useCreditCardApplyStore();
  const { show: showLoading, hide: hideLoading } = useLoadingStore();
  const [status, setStatus] = useState<CreditCardApplyModalStatus>('checking');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const checkedOfferIdRef = useRef<string | null>(null);
  const redirectAbortRef = useRef<AbortController | null>(null);
  useBodyScrollLock(isModalOpen);
  const { requestClose, releaseHistoryEntry } = useCloseOnBrowserBack({
    isOpen: isModalOpen,
    onClose: closeApply,
    historyKey: CREDIT_CARD_APPLY_MODAL_HISTORY_KEY,
  });

  const openPartnerRedirectAndClose = useCallback(async (): Promise<void> => {
    const offer = useCreditCardApplyStore.getState().selectedOffer;
    if (!offer) {
      return;
    }
    redirectAbortRef.current?.abort();
    const controller = new AbortController();
    redirectAbortRef.current = controller;
    setIsRedirecting(true);
    const result = await resolveCreditCardPartnerRedirect(
      offer.name,
      offer.link,
      controller.signal
    );
    if (controller.signal.aborted) {
      setIsRedirecting(false);
      return;
    }
    if ('error' in result) {
      setIsRedirecting(false);
      toast.error(result.error, {
        description: 'Unable to continue your credit card application.',
      });
      closeApply();
      return;
    }
    // Prevent modal history.back() from canceling the partner navigation.
    releaseHistoryEntry();
    redirectToCreditCardUtmLink(result.redirectUrl);
    // If the browser blocks/cancels navigation, do not leave the overlay stuck.
    window.setTimeout(() => {
      if (controller.signal.aborted) {
        return;
      }
      setIsRedirecting(false);
      closeApply();
    }, 2500);
  }, [closeApply, releaseHistoryEntry]);

  const openPartnerRedirectRef = useRef(openPartnerRedirectAndClose);
  openPartnerRedirectRef.current = openPartnerRedirectAndClose;

  useEffect(() => {
    if (!isModalOpen || !selectedOffer) {
      checkedOfferIdRef.current = null;
      redirectAbortRef.current?.abort();
      redirectAbortRef.current = null;
      setIsRedirecting(false);
      return;
    }
    if (checkedOfferIdRef.current === selectedOffer.id) {
      return;
    }
    checkedOfferIdRef.current = selectedOffer.id;
    setStatus('checking');
    const controller = new AbortController();
    const offerId = selectedOffer.id;
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
          await openPartnerRedirectRef.current();
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
      hideLoading();
      // Strict Mode remount / dep change must be allowed to re-run the check.
      if (checkedOfferIdRef.current === offerId) {
        checkedOfferIdRef.current = null;
      }
    };
  }, [hideLoading, isModalOpen, selectedOffer, showLoading]);

  if (!isModalOpen || !selectedOffer) {
    return null;
  }

  if (isRedirecting) {
    return (
      <CreditCardRedirectLoading
        partnerName={selectedOffer.title}
        partnerImageUrl={selectedOffer.imageUrl}
      />
    );
  }

  let content: React.ReactNode;
  if (status === 'checking') {
    content = <LoadingScreen />;
  } else {
    content = (
      <CreditCardForm
        creditCardName={selectedOffer.name}
        creditCardTitle={selectedOffer.title}
        onClose={requestClose}
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
