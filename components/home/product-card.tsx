'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import type { MouseEvent } from 'react';
import type { ProductCardProps } from './product-card.types';

const ProductCard = ({
  label,
  href,
  icon: Icon,
  imagePath,
  requiresAuth = false,
}: ProductCardProps): React.ReactNode => {
  const router = useRouter();
  const { isAuthenticated, openAuthModalWithAction } = useAuth();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (!requiresAuth) {
      return;
    }

    event.preventDefault();

    if (!isAuthenticated) {
      openAuthModalWithAction({
        type: 'navigate_to_offer',
        href,
      });
      return;
    }

    router.push(href);
  };

  return (
    <div className="h-full">
      <Link
        href={href}
        onClick={handleClick}
        className="wc-product-card flex flex-col items-center justify-center gap-3 p-4 h-full rounded-xl md:border md:border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg transition-colors transition-shadow duration-300"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-wc-blue-50 flex items-center justify-center">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={label}
              width={32}
              height={32}
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
            />
          ) : Icon ? (
            <Icon className="w-7 h-7 text-wc-blue-600" strokeWidth={2} />
          ) : null}
        </div>

        <span className="text-xs sm:text-sm font-medium text-gray-700 text-center leading-tight whitespace-nowrap">
          {label}
        </span>
      </Link>
    </div>
  );
};

export default ProductCard;
