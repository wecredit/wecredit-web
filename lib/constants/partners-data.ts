import { IMAGES } from './images';

/**
 * Partner information with detailed contact and grievance officer details
 * Used for the Our Partners page
 */
export interface PartnerDetail {
  /** Unique identifier for the partner */
  id: string;
  /** Path to partner logo image */
  logo: string;
  /** Company name */
  companyName: string;
  /** Contact phone number */
  phone: string;
  /** Grievance officer name */
  officer: string;
  /** Grievance email address */
  email: string;
  /** Company website URL */
  websiteLink: string;
  /** Key Facts Statement (KFS) URL */
  keyFactsStatement?: string;
}

/**
 * Static partner data for Personal Loans Partners page
 * Contains detailed information including grievance officer details
 */
export const PERSONAL_LOAN_PARTNERS: PartnerDetail[] = [
  {
    id: 'olyv-india',
    logo: `${IMAGES.PARTNERS.BASE_PATH}/OLYV.png`,
    companyName: 'Olyv India',
    phone: '+91 9986640571',
    officer: 'Madam H M',
    email: 'grievance@smartcoin.co.in',
    websiteLink: 'https://www.olyv.co.in/',
  },
  {
    id: 'moneyview',
    logo: `${IMAGES.PARTNERS.BASE_PATH}/moneyview.png`,
    companyName: 'MoneyView',
    phone: '+91 1800 102 5555',
    officer: 'Mr. Rajesh Kumar',
    email: 'grievance@moneyview.in',
    websiteLink: 'https://www.moneyview.in/',
  },
  {
    id: 'kreditbee',
    logo: `${IMAGES.PARTNERS.BASE_PATH}/KB.png`,
    companyName: 'KreditBee',
    phone: '+91 1800 258 0000',
    officer: 'Ms. Priya Sharma',
    email: 'grievance@kreditbee.com',
    websiteLink: 'https://www.kreditbee.com/',
  },
  {
    id: 'lt-finance',
    logo: `${IMAGES.PARTNERS.BASE_PATH}/L&T.png`,
    companyName: 'L&T Finance',
    phone: '+91 1800 209 0000',
    officer: 'Mr. Anil Patel',
    email: 'grievance@ltfs.com',
    websiteLink: 'https://www.ltfs.com/',
  },
  {
    id: 'zype',
    logo: `${IMAGES.PARTNERS.BASE_PATH}/ZYPE.png`,
    companyName: 'Zype',
    phone: '+91 1800 123 4567',
    officer: 'Ms. Sneha Reddy',
    email: 'grievance@zype.in',
    websiteLink: 'https://www.zype.in/',
  },
];
