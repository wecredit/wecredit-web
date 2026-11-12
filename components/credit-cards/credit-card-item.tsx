'use client';

/**
 * Single credit card offer: title, optional intro/image, Apply CTA.
 * Apply Now requires login, then status check / form / utmLink redirect.
 */

import type { CreditCardItemProps } from './credit-card-item.types';
import { CREDIT_CARD_FEATURE_TAGS } from './credit-card-item.config';
import { useCreditCardApply } from '@/hooks/use-credit-card-apply';
import ActionButton from '../shared/action-button';
import { IMAGES } from '@/lib/constants/images';
import { COLORS } from '@/lib/constants/colors';

const CreditCardItem = ({ card }: CreditCardItemProps): React.ReactNode => {
  const { handleApplyNow } = useCreditCardApply();
  const hasLenderImage = Boolean(card.imageUrl);
  const imageSrc = card.imageUrl || IMAGES.ICONS.CREDIT_CARD_OFFER;

  const featureTagsContent = (
    <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
      {CREDIT_CARD_FEATURE_TAGS.map((tag, index) => (
        <li
          key={`${tag}-${index}`}
          className="rounded px-3 py-1 text-xs font-medium bg-white text-brand-primary"
        >
          {tag}
        </li>
      ))}
    </ul>
  );

  let imageClassName: string;
  if (hasLenderImage) {
    imageClassName = 'w-full h-full object-contain';
  } else {
    imageClassName = 'w-full h-full object-cover';
  }

  return (
    <article
      className="w-full relative rounded-2xl border border-brand-primary/20 overflow-hidden flex flex-col p-4 sm:p-5 gap-4 shadow-sm transition-transform hover:scale-[1.02]"
      style={{
        background: `linear-gradient(180deg, ${COLORS.brand.lightestGradient.from} 0%, ${COLORS.brand.lightestGradient.to} 100%)`,
      }}
      data-card-title={card.title}
    >
      <h2 className="text-neutral-900 text-[18px] leading-[22px] font-semibold text-left">
        {card.title}
      </h2>

      <div className="relative w-full h-48 sm:h-52 shrink-0 overflow-hidden rounded-xl flex items-center justify-center bg-transparent">
        <img
          src={imageSrc}
          alt={card.title}
          className={imageClassName}
          loading="lazy"
        />
      </div>

      {featureTagsContent}

      <ActionButton
        type="button"
        onClick={() => handleApplyNow(card)}
        fullWidth
        className="text-sm font-semibold rounded-lg py-2.5 h-auto"
      >
        Apply Now
      </ActionButton>
    </article>
  );
};

export default CreditCardItem;
