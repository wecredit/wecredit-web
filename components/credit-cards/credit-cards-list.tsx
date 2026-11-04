'use client';

/**
 * Renders a responsive grid of credit card offer cards.
 * Assigns "Popular" to first card (SBI SimplyCLICK) and "Top Choices" to SBI ELITE.
 */

import { CREDIT_CARDS } from '@/lib/constants/credit-card-data';
import CreditCardItem from './credit-card-item';

const BADGE_POPULAR = 'Popular';
const BADGE_TOP_CHOICES = 'Top Choices';
const TITLE_ELITE = 'SBI ELITE';

const CreditCardsList = (): React.ReactNode => {
  if (CREDIT_CARDS.length === 0) {
    return (
      <div className="mx-4 my-4 lg:mt-20 max-w-6xl mx-auto flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground text-lg">Coming Soon</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mx-4 my-4 lg:mt-20 max-w-6xl mx-auto">
      {CREDIT_CARDS.map((card, index) => {
        const isFirst = index === 0;
        const isElite = card.title === TITLE_ELITE;
        const badge = isFirst ? BADGE_POPULAR : isElite ? BADGE_TOP_CHOICES : undefined;

        return (
          <CreditCardItem key={card.title} card={card} badge={badge} />
        );
      })}
    </div>
  );
};

export default CreditCardsList;
