'use client';

/**
 * Credit cards page: list from get-lenders, FAQ, and apply modal.
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaqSection, PageHeading } from '@/components/shared';
import { PageLoader } from '@/components/shared/page-loader';
import { useRequireLogin } from '@/hooks/use-require-login';
import { useAuthStore } from '@/stores/auth-store';
import CreditCardsList from './credit-cards-list';
import CreditCardApplyModal from './credit-card-apply-modal';

const CreditCardsPageContent = (): React.ReactNode => {
  const router = useRouter();
  const { isAuthInitialized, isAuthenticated } = useAuthStore();

  const handleAuthCancel = useCallback((): void => {
    router.replace('/');
  }, [router]);

  useRequireLogin({
    shouldTrigger: isAuthInitialized,
    onCancel: handleAuthCancel,
  });

  if (!isAuthInitialized || !isAuthenticated) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="py-8 sm:py-10 pt-20">
        <PageHeading className="sr-only">Best Credit Card Offers in India</PageHeading>

        <section className="mb-12 sm:mb-16 px-4" aria-label="Credit card offers">
          <CreditCardsList />
        </section>

        <FaqSection />
      </div>
      <CreditCardApplyModal />
    </div>
  );
};

export default CreditCardsPageContent;
