'use client';

/**
 * Single credit card offer: title, optional intro/image, Apply CTA.
 * Apply Now requires login, then status check / form / utmLink redirect.
 */

import type { CreditCardItemProps } from './credit-card-item.types';
import { useCreditCardApply } from '@/hooks/use-credit-card-apply';
import ActionButton from '../shared/action-button';
import { IMAGES } from '@/lib/constants/images';

const CreditCardItem = ({ card }: CreditCardItemProps): React.ReactNode => {
  const { handleApplyNow } = useCreditCardApply();
  const imageSrc = card.imageUrl || IMAGES.ICONS.CREDIT_CARD;

  let introContent: React.ReactNode = null;
  if (card.intro) {
    introContent = (
      <p className="text-zinc-500 text-xs font-normal font-sans leading-4 my-2 line-clamp-3">
        {card.intro}
      </p>
    );
  }

  return (
    <article
      className="w-full relative bg-white rounded-xl shadow overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
      data-card-title={card.title}
    >
      <div className="relative w-full h-48 shrink-0 overflow-hidden bg-wc-blue-50 flex items-center justify-center">
        <img
          src={imageSrc}
          alt={card.title}
          className="max-h-24 max-w-[70%] object-contain"
          loading="lazy"
        />
      </div>

      <div className="flex-1 flex flex-col p-2.5 min-h-0">
        <h2 className="text-neutral-900 text-[18px] leading-[22px] font-medium text-left">
          {card.title}
        </h2>
        {introContent}
      </div>

      <div className="border-t border-gray-200 p-2.5 flex items-center justify-end shrink-0">
        <ActionButton
          type="button"
          onClick={() => handleApplyNow(card)}
          className="text-xs font-medium rounded-lg py-1 w-30"
        >
          Apply Now
        </ActionButton>
      </div>
    </article>
  );
};

export default CreditCardItem;
