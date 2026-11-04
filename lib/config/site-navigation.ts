import type { NavigationLink } from '@/types/navigation';

export const SITE_NAME = 'WeCredit';

export const LOAN_STATUS_LINK: NavigationLink = {
  id: 2,
  label: 'Loan Status',
  url: '/offers',
  openInNewTab: false,
  children: [],
};

export const LOANS_LINK: NavigationLink = {
  id: 5,
  label: 'Loans',
  url: '/personal-loan',
  openInNewTab: false,
  children: [
    { id: 51, label: 'Personal Loan', url: '/personal-loan', openInNewTab: false, children: [] },
    { id: 52, label: 'Business Loan', url: '/business-loan', openInNewTab: false, children: [] },
    { id: 53, label: 'Car Loan', url: '/car-loan', openInNewTab: false, children: [] },
    { id: 54, label: 'Home Loan', url: '/home-loan', openInNewTab: false, children: [] },
    { id: 55, label: 'Gold Loan', url: '/gold-loan', openInNewTab: false, children: [] },
  ],
};

export const TOOLS_LINK: NavigationLink = {
  id: 6,
  label: 'Tools',
  url: '/calculator/personal-loan',
  openInNewTab: false,
  children: [
    { id: 61, label: 'Personal Loan Calculator', url: '/calculator/personal-loan', openInNewTab: false, children: [] },
    { id: 62, label: 'EMI Calculator', url: '/calculator/emi', openInNewTab: false, children: [] },
    { id: 63, label: 'Business Loan Calculator', url: '/calculator/business-loan', openInNewTab: false, children: [] },
    { id: 64, label: 'Check Credit Score', url: '/bureau-report/', openInNewTab: false, children: [] },
  ],
};

export const HEADER_LINKS: NavigationLink[] = [
  { id: 1, label: 'Home', url: '/', openInNewTab: false, children: [] },
  LOANS_LINK,
  TOOLS_LINK,
  { id: 3, label: 'Blogs', url: '/blog', openInNewTab: false, children: [] },
  { id: 4, label: 'About Us', url: '/about-us/', openInNewTab: false, children: [] },
];

export function getVisibleHeaderLinks(isAuthenticated: boolean): NavigationLink[] {
  if (!isAuthenticated) {
    return HEADER_LINKS;
  }
  const [home, ...rest] = HEADER_LINKS;
  return [home, LOAN_STATUS_LINK, ...rest];
}
