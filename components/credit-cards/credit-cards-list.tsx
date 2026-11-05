'use client';

/**
 * Fetches and renders credit card offers from get-lenders?lenderType=creditcard.
 */

import type { ReactNode } from 'react';
import { useCreditCardLenders } from '@/hooks/use-credit-card-lenders';
import CreditCardItem from './credit-card-item';
import { PageLoader } from '@/components/shared/page-loader';

const LIST_STATUS = {
  LOADING: 'loading',
  EMPTY: 'empty',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

const CreditCardsList = (): React.ReactNode => {
  const { offers, status } = useCreditCardLenders();

  let content: ReactNode;
  if (status === LIST_STATUS.LOADING) {
    content = <PageLoader />;
  } else if (status === LIST_STATUS.ERROR) {
    content = (
      <div className="mx-4 my-4 lg:mt-20 max-w-6xl mx-auto flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground text-lg">
          Unable to load credit cards. Please try again later.
        </p>
      </div>
    );
  } else if (status === LIST_STATUS.EMPTY) {
    content = (
      <div className="mx-4 my-4 lg:mt-20 max-w-6xl mx-auto flex min-h-[200px] items-center justify-center">
        <p className="text-muted-foreground text-lg">Coming Soon</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center mx-4 my-4 lg:mt-20 max-w-6xl mx-auto">
        {offers.map((card) => (
          <CreditCardItem key={card.id} card={card} />
        ))}
      </div>
    );
  }

  return content;
};

export default CreditCardsList;
