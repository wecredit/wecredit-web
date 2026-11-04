import { ShoppingBag, BriefcaseBusiness, Home } from 'lucide-react';
import ProductCard from './product-card';
import { IMAGES } from '@/lib/constants/images';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface Product {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  imagePath?: string;
}

const products: Product[] = [
  {
    id: 'personal-loan',
    label: 'Personal Loan',
    href: '/personal-loan',
    icon: ShoppingBag,
    imagePath: IMAGES.ICONS.PERSONAL_LOAN,
  },
  {
    id: 'business-loan',
    label: 'Business Loan',
    href: '/business-loan',
    icon: BriefcaseBusiness,
    imagePath: IMAGES.ICONS.BUSINESS_LOAN,
  },
  {
    id: 'car-loan',
    label: 'Car Loan',
    href: '/car-loan',
    icon: ShoppingBag,
    imagePath: IMAGES.LOAN_ICONS.CAR_LOAN,
  },
  // {
  //   id: 'credit-cards',
  //   label: 'Credit Cards',
  //   href: '/credit-cards',
  //   icon: CreditCard,
  //   imagePath: IMAGES.ICONS.CREDIT_CARD,
  // },
  {
    id: 'home-loan',
    label: 'Home Loan',
    href: '/home-loan',
    icon: Home,
    imagePath: IMAGES.LOAN_ICONS.HOME_LOAN,
  },
  {
    id: 'gold-loan',
    label: 'Gold Loan',
    href: '/gold-loan',
    icon: BriefcaseBusiness,
    imagePath: IMAGES.LOAN_ICONS.GOLD_LOAN,
  },
];

const ProductsSection = (): React.ReactNode => {
  return (
    <section className="bg-white wc-section-gap">
      <div className="mx-auto max-w-7xl xl:px-0 px-4">
        <h2 className="wc-section-heading text-gray-900">
          Our Products
        </h2>

        <div className="grid grid-cols-6 gap-3 lg:flex lg:flex-wrap lg:justify-center">
          {products.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                'col-span-2',
                index === 3 && 'col-start-2',
                index === 4 && 'col-start-4',
                'lg:col-auto lg:w-[200px] lg:min-w-[200px]'
              )}
            >
              <ProductCard
                id={product.id}
                label={product.label}
                href={product.href}
                icon={product.icon}
                imagePath={product.imagePath}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
