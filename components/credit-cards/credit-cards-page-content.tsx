'use client';

/**
 * Credit cards page content: header, card list, and FAQ section.
 * Renders static credit card offers with external application links.
 */

import { FaqSection, PageHeading } from '@/components/shared';
import CreditCardsList from './credit-cards-list';

const CreditCardsPageContent = (): React.ReactNode => {
  return (
    <div className="min-h-screen bg-white">
      <div className="py-8 sm:py-10 pt-20">
        <PageHeading className="sr-only">Best Credit Card Offers in India</PageHeading>

        {/* Credit cards grid */}
        <section className="mb-12 sm:mb-16 px-4" aria-label="Credit card offers">
          <CreditCardsList />
        </section>

        {/* FAQ section */}
        <FaqSection />
      </div>
    </div>
  );
};

export default CreditCardsPageContent;
