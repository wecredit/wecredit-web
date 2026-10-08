import type { SlideContent } from "@/components/home/hero-carousel";
import { Partner } from "@/types/wecredit";
import { IMAGES } from "./images";
import { Testimonial } from "@/components/home/testimonials-section";

/**
 * Cache revalidation times for different data types
 * Optimized to reduce Vercel function costs while maintaining data freshness
 */
export const CACHE_TIMES = {
  HOUR_24: 86400, // 24 hours
  HOUR_1: 3600, // 1 hour
  MINUTE_5: 300, // 5 minutes

  STATIC_PAGES: 3600, // 1 hour
} as const;

/**
 * List of all partner logos
 * Images should be placed in /public/assets/images/partners/
 */
export const PARTNERS: Partner[] = [
  { name: "MoneyView", logo: `${IMAGES.PARTNERS.BASE_PATH}/moneyview.png` },
  { name: "KreditBee", logo: `${IMAGES.PARTNERS.BASE_PATH}/KB.png` },
  { name: "L&T Finance", logo: `${IMAGES.PARTNERS.BASE_PATH}/L&T.png` },
  { name: "Olyv", logo: `${IMAGES.PARTNERS.BASE_PATH}/OLYV.png` },
  { name: "Zype", logo: `${IMAGES.PARTNERS.BASE_PATH}/ZYPE.png` },
  { name: "mPokket", logo: `${IMAGES.PARTNERS.BASE_PATH}/MPOKKET.png` },
  {
    name: "Hero Fincorp",
    logo: `${IMAGES.PARTNERS.BASE_PATH}/HERO FINCORPV.png`,
  },
  {
    name: "Poonawalla Fincorp",
    logo: `${IMAGES.PARTNERS.BASE_PATH}/Poonawala fincorp.png`,
  },
  { name: "Ram Fincorp", logo: `${IMAGES.PARTNERS.BASE_PATH}/Ram fincorp.png` },
  { name: "Creditt+", logo: `${IMAGES.PARTNERS.BASE_PATH}/creditt.png` },
  { name: "True Balance", logo: `${IMAGES.PARTNERS.BASE_PATH}/truebalance.png` },
  {
    name: "Chintamani Finlease",
    logo: `${IMAGES.PARTNERS.BASE_PATH}/chintamani finlease.png`,
  },
  { name: "FLot", logo: `${IMAGES.PARTNERS.BASE_PATH}/Flot.png` },
  { name: "TrustPaisa", logo: `${IMAGES.PARTNERS.BASE_PATH}/Trust Paisa.png` },
  {
    name: "LendingPlate",
    logo: `${IMAGES.PARTNERS.BASE_PATH}/lending plate.png`,
  },
  { name: "FDPL Finance", logo: `${IMAGES.PARTNERS.BASE_PATH}/FDPL.png` },
  {
    name: "Salary On Time",
    logo: `${IMAGES.PARTNERS.BASE_PATH}/Salary on time.png`,
  },
  {
    name: "Emergency Paisa",
    logo: `${IMAGES.PARTNERS.BASE_PATH}/emergency paisa.png`,
  },
  { name: "BrightLoans", logo: `${IMAGES.PARTNERS.BASE_PATH}/Bright loans.png` },
  { name: "FatakPay", logo: `${IMAGES.PARTNERS.BASE_PATH}/FATAK PAY.png` },
  { name: "Dhanvarsha", logo: `${IMAGES.PARTNERS.BASE_PATH}/dhanvarsha.png` },
  { name: "Fatafat", logo: `${IMAGES.PARTNERS.BASE_PATH}/fatafat.png` },
  { name: "Loan Bazaar", logo: `${IMAGES.PARTNERS.BASE_PATH}/loan_bazaar.png` },
  { name: "TezCredit", logo: `${IMAGES.PARTNERS.BASE_PATH}/tezcredit.png` },
  { name: "Cashvia", logo: `${IMAGES.PARTNERS.BASE_PATH}/cashvia.png` },
  { name: "Branch", logo: `${IMAGES.PARTNERS.BASE_PATH}/branch.png` },
  { name: "Vivifi", logo: `${IMAGES.PARTNERS.BASE_PATH}/vivifi-logo.png` },
];


/**
 * Split partners into rows for the marquee display
 */
const PARTNERS_PER_ROW = Math.ceil(PARTNERS.length / 3);
export const ROW_1_PARTNERS = PARTNERS.slice(0, PARTNERS_PER_ROW);
export const ROW_2_PARTNERS = PARTNERS.slice(PARTNERS_PER_ROW, PARTNERS_PER_ROW * 2);
export const ROW_3_PARTNERS = PARTNERS.slice(PARTNERS_PER_ROW * 2);

/** Carousel slides data */
export const HOME_PAGE_H1 = 'Compare Personal Loans from 25+ Lenders';

export const HERO_CAROUSEL_SLIDES: SlideContent[] = [
  {
    id: 'slide-2',
    image: IMAGES.CAROUSEL.SLIDE_1,
    titleWhite: 'Compare Personal Loan',
    titleGradient: 'from 25+ Lenders',
    description:
      'Find the right loan offer based on your profile, interest rate, eligibility, and repayment needs - all in one place.',
    ctaText: "Apply For Loan",
    ctaLink: "/personal-loan",
    alt: 'Compare personal loan offers from 25+ lenders on WeCredit',
  },
  {
    id: "slide-1",
    image: IMAGES.CAROUSEL.COMPARE_PERSONAL_LOAN_ILLUSTRATION,

    titleWhite: "More Savings",
    titleGradient: "on Every Loan",
    description:
      "Experience the next generation of financial freedom. We connect you with top-tier lenders using AI-driven precision for the lowest possible rates.",

    ctaText: 'Compare Offers',
    ctaLink: '/personal-loan',
    alt: 'Save more on every loan by comparing lender offers on WeCredit',
  },
  {
    id: "slide-3",
    image: IMAGES.CAROUSEL.SLIDE_3,
    titleWhite: "More Choices",
    titleGradient: "Better Loan Deals",
    description:
      "Check your credit score and unlock personalized loan offers from trusted lenders. Fast, secure, and completely free.",
    ctaText: "Check Eligibility",
    ctaLink: "/bureau-report",
    alt: 'Check your credit score and unlock better loan deals on WeCredit',
  },

];


/** Static testimonials data */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'testimonial-1',
    thumbnailUrl: IMAGES.LOGOS.TRANSPARENT,
    videoUrl: '/videos/dummy.mp4',
    quote: 'I got my loan approved faster than I ever expected completely hassle-free!',
    customerName: 'Sarah M.',
  },
  {
    id: 'testimonial-2',
    thumbnailUrl: IMAGES.LOGOS.TRANSPARENT,
    videoUrl: '/videos/dummy.mp4',
    quote: 'WeCredit made the entire process so simple. Highly recommended!',
    customerName: 'Rahul K.',
  },
  {
    id: 'testimonial-3',
    thumbnailUrl: IMAGES.LOGOS.TRANSPARENT,
    videoUrl: '/videos/dummy.mp4',
    quote: 'Best loan experience I have ever had. Quick approval and great rates!',
    customerName: 'Priya S.',
  },
  {
    id: 'testimonial-4',
    thumbnailUrl: IMAGES.LOGOS.TRANSPARENT,
    videoUrl: '/videos/dummy.mp4',
    quote: 'From application to disbursement, everything was seamless!',
    customerName: 'Amit P.',
  },
];


export const UNITY_CONSENT = `I hereby give my consent to Unity Small Finance Bank Limited. as lender to collect, store and verify my credit report from Credit Bureaus and KYC details for the processing of my loan application and contact me through SMS / WhatsApp / Call with reference to my loan application.`

// Dedicated partner terms route for multi-lender consent UI.
export const MULTILENDER_PARTNER_TERMS_HREF = '/partner-terms-and-conditions';


export const TEAM_MEMBERS = [
  {
    image:
      'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/person_placeholder.png',
    title: 'Mukul Devpura',
  },
  {
    image:
      'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/person_placeholder.png',
    title: 'Brijesh Chokhra',
  },
  {
    image:
      'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/person_placeholder.png',
    title: 'Laksh Dua',
  },
  {
    image:
      'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/person_placeholder.png',
    title: 'Sumit Chokhra',
  },
];

export const ACHIEVEMENTS = [
  {
    title: 'ONDC Partnership',
    description:
      'We started working with ONDC partners in 2024, expanding our reach and collaboration in the digital commerce ecosystem.',
    image: 'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/ondccard.png',
  },
  {
    title: 'Jobs Created',
    description:
      'WeCredit has provided over 400 jobs, contributing to employment and growth in the financial sector.',
    image: 'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/jobs_created.png',
  },
  {
    title: 'Strong Lending Network',
    description:
      'We work with 25–30 lenders, NBFCs, fintechs, and banks, ensuring a wide range of credit options for our customers.',
    image: 'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com/strong_lending_networks.png',
  },
];

export const BRANDS = [
  {
    name: 'LoansBazaar',
    // Temporary placeholder — replace with IMAGES.BRANDS.LOANSBAZAAR when final logo is ready
    logo: `${IMAGES.PARTNERS.BASE_PATH}/loanbazaar_new.png`,
    url: 'https://loansbazaar.co',
    displayUrl: 'LoansBazaar',
  },


  {
    name: 'FatafatLoans',
    // Temporary placeholder — replace with IMAGES.BRANDS.FATAFATLOANS when final logo is ready
    logo: `${IMAGES.PARTNERS.BASE_PATH}/fatfatloans_dark.png`,
    url: 'https://fatafatloans.com',
    displayUrl: 'FatafatLoans',
  },
];

export const MARKETPLACE_DISCLAIMER =
  'WeCredit is an independent technology-enabled credit marketplace that helps customers discover, compare and connect with multiple banks and NBFCs. WeCredit is not a lender and does not sanction or disburse loans.';

export const OUR_PARTNER_DISCLAIMER =
  'Loan approval, interest rate, tenure, fees and other terms are independently determined by the respective lending partner.'

export const TERMS_DISCLAIMER =
  'WeCredit operates a multi-lender marketplace providing customers access to credit products offered by independent lending partners.';

export const TERMS_OF_USE_NOTE =
  'WeCredit does not undertake lending, underwriting, sanction, pricing, disbursement, servicing or collection on behalf of any particular lender.';

export const LOAN_PRODUCT_PAGE_NOTE = 'Loan amount, interest rate, tenure and fees are determined by the respective lending partner.'