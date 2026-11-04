'use client';

/**
 * Credit cards page: list from get-lenders, FAQ, and apply modal.
 */

import { FaqSection, PageHeading } from '@/components/shared';
import CreditCardsList from './credit-cards-list';
import CreditCardApplyModal from './credit-card-apply-modal';

const CreditCardsPageContent = (): React.ReactNode => {
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
