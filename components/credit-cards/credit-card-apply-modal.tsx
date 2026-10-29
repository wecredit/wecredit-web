'use client';

/**
 * After Apply Now + login: check get-creditcard-leads.
 * Existing details → open get-lenders utmLink.
 * No details → show application form → credit-card-lead → open utmLink.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock';
import { fetchCreditCardLeadStatus } from '@/lib/api/credit-card-service';
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
  useBodyScrollLock(isModalOpen);

  const openUtmLinkAndClose = useCallback((): void => {
    const link = useCreditCardApplyStore.getState().selectedOffer?.link ?? '';
    closeApply();
    // Same-tab redirect to get-lenders utmLink (e.g. Kiwi) — avoids popup blockers after async checks.
    redirectToCreditCardUtmLink(link);
  }, [closeApply]);

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
          openUtmLinkAndClose();
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
    };
  }, [
    hideLoading,
    isModalOpen,
    openUtmLinkAndClose,
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
        onSuccess={openUtmLinkAndClose}
        isModal
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">{content}</div>
  );
};

export default CreditCardApplyModal;
