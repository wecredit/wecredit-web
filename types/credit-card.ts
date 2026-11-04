/**
 * Credit card data structure for WeCredit credit card offers.
 * Used by credit card list and item components.
 */

export interface CreditCard {
  title: string;
  imageAsset: string;
  link: string;
  intro: string;
  benefits: string[];
  feeDetails: string;
  gradientColors: string[];
  /** Whether to clip image corners with border-radius (default: false) */
  clip?: boolean;
  amount: string;
}
