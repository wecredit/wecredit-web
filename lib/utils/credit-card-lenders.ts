import type { CreditCardLender, CreditCardOffer } from '@/types/credit-card';

/**
 * Formats a lender name for display (e.g. "kiwi" → "Kiwi").
 */
export function formatCreditCardTitle(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/**
 * Cleans get-lenders utmLink values (trailing quotes / encoded quotes from API).
 */
export function sanitizeCreditCardUtmLink(utmLink: string): string {
  let link = utmLink.trim();
  if (!link) {
    return '';
  }
  // Strip wrapping or trailing ASCII / URL-encoded quotes from malformed API values.
  link = link.replace(/^["']+|["']+$/g, '');
  link = link.replace(/%22$/i, '');
  return link.trim();
}

/**
 * Navigates the current tab to the get-lenders utmLink.
 */
export function redirectToCreditCardUtmLink(utmLink: string): void {
  const link = sanitizeCreditCardUtmLink(utmLink);
  if (!link) {
    return;
  }
  window.location.assign(link);
}

/**
 * Maps API credit-card lenders to simple display offers.
 * Keeps lenders that have a name and apply link.
 */
export function mapCreditCardLendersToOffers(
  lenders: CreditCardLender[]
): CreditCardOffer[] {
  if (!Array.isArray(lenders) || lenders.length === 0) {
    return [];
  }
  return lenders
    .filter((lender) => {
      const name = lender.name?.trim() ?? '';
      const link = sanitizeCreditCardUtmLink(lender.utmLink ?? '');
      return name.length > 0 && link.length > 0;
    })
    .map((lender) => ({
      id: String(lender.id),
      name: lender.name.trim(),
      title: formatCreditCardTitle(lender.name),
      link: sanitizeCreditCardUtmLink(lender.utmLink),
      intro: lender.description?.trim() ?? '',
      imageUrl: (lender.imageUrl || lender.logo || '').trim(),
    }));
}
