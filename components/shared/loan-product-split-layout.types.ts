import type { FormEvent, ReactNode } from 'react';
import type { LoanFeatureAccent, LoanFeatureItem } from './loan-feature-highlights.types';

export type LoanProductHeroSize = 'default' | 'large';

export interface LoanProductHeroConfig {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  size?: LoanProductHeroSize;
}

export interface LoanProductSplitLayoutProps {
  isModal?: boolean;
  accent?: LoanFeatureAccent;
  title: string;
  headline: string;
  subheadline?: string;
  formTitle: string;
  hero: LoanProductHeroConfig;
  /** Optional full-section banner pattern. Perspective is drawn in CSS. */
  bannerPattern?: 'perspective';
  /** Optional full-section banner texture image. */
  bannerPatternSrc?: string;
  features?: readonly LoanFeatureItem[];
  canSubmit: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (event: FormEvent) => void;
  children: ReactNode;
}
