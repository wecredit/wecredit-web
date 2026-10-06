/**
 * Centralized image and SVG paths for the entire project.
 * Use these constants instead of hardcoded strings to ensure consistency
 * and make path changes easier.
 */
import XIcon from '@/public/assets/images/XIcon.png';
import comparePersonalLoanIllustration from '@/public/assets/images/compare-personal-loan-illustration.png';
import appPhoneMockup from '@/public/assets/images/wecredit-app-phone-mockup.png';

const BUCKET_IMAGE_URL = 'https://wecredit-main-website-assets.s3.ap-south-1.amazonaws.com';


export const IMAGES = {
  LOGOS: {
    DEFAULT: `${BUCKET_IMAGE_URL}/logo.png`,
    TRANSPARENT: `${BUCKET_IMAGE_URL}/logo-transparent.jpg`,
    X_ICON: XIcon,
  },
  CAROUSEL: {
    SLIDE_1: `${BUCKET_IMAGE_URL}/carousel-one.png`,
    SLIDE_2: `${BUCKET_IMAGE_URL}/carousel-two.png`,
    SLIDE_3: `${BUCKET_IMAGE_URL}/carousel-three.png`,
    COMPARE_PERSONAL_LOAN_ILLUSTRATION: comparePersonalLoanIllustration,
  },
  CERTIFICATIONS: {
    ISO_BADGE_1: `${BUCKET_IMAGE_URL}/certifications/iso-badge-1.png`,
    CII_LOGO: `${BUCKET_IMAGE_URL}/certifications/cii-logo.png`,
    ISO_CERTIFIED: `${BUCKET_IMAGE_URL}/certifications/iso-certified-company.png`,
  },
  APP: {
    GOOGLE_PLAY: `${BUCKET_IMAGE_URL}/google-play-badge.png`,
    APP_STORE: `${BUCKET_IMAGE_URL}/app-store-badge.png`,
    QR: `${BUCKET_IMAGE_URL}/QR.png`,
    MOCKUP: `${BUCKET_IMAGE_URL}/wecredit-app-mock.png`,
    PHONE_MOCKUP: appPhoneMockup,
  },
  ILLUSTRATIONS: {
    EMI_CALC: `${BUCKET_IMAGE_URL}/emi-calculator-illustration.png`,
    PERSONAL_LOAN: `${BUCKET_IMAGE_URL}/personal-loan-illustration.png`,
    CREDIT_SCORE: `${BUCKET_IMAGE_URL}/check-credit-score.png`,
    BUSINESS_LOAN_CALC: `${BUCKET_IMAGE_URL}/business-loan-calculator-illustration.png`,
    OTP_SMS: `${BUCKET_IMAGE_URL}/otp-sms.png`,
  },
  TOOLS_AND_CALCULATORS_ILLUSTRATIONS: {
    TC_EMI_CALC: `${BUCKET_IMAGE_URL}/EMI CALCULATOR Illustrtaion tool.png`,
    TC_PERSONAL_LOAN: `${BUCKET_IMAGE_URL}/PL Illustrtaion tool.png`,
    TC_CREDIT_SCORE: `${BUCKET_IMAGE_URL}/Check credit score tools.png`,
    TC_BUSINESS_LOAN_CALC: `${BUCKET_IMAGE_URL}/BL CALCULATOR  Illustrtaion tool.png`,
    
  },
  
  DIRECT_CONTACT_EXPERTS: {
    LAKASH: `${BUCKET_IMAGE_URL}/person_placeholder.png`,
    PLAYSTORE_ICON: `${BUCKET_IMAGE_URL}/playstoreicon.png`,
  },
  LOAN_ICONS: {
    GOLD_LOAN: `${BUCKET_IMAGE_URL}/gold-loan.png`,
    CAR_LOAN: `${BUCKET_IMAGE_URL}/car-loan.png`,
    HOME_LOAN: `${BUCKET_IMAGE_URL}/home-loan.png`,
  },
  ICONS: {
    PERCENTAGE: `${BUCKET_IMAGE_URL}/percentage-discount.png`,
    CALENDAR: `${BUCKET_IMAGE_URL}/calender.png`,
    PERSONAL_LOAN: `${BUCKET_IMAGE_URL}/personal-loan-icon.png`,
    BUSINESS_LOAN: `${BUCKET_IMAGE_URL}/business-loan-icon.png`,
    WECREDIT_HEART: `${BUCKET_IMAGE_URL}/wecredit-heart.png`,
    PARTNER_WITH_US: `${BUCKET_IMAGE_URL}/partner-with-us.png`,
    CONTACT_US: `${BUCKET_IMAGE_URL}/contact-us.png`,
    PWS_SUCCESS: `${BUCKET_IMAGE_URL}/pws-success.png`,
    GUARED: `${BUCKET_IMAGE_URL}/guard.png`,
    THUMB_PRINT: `${BUCKET_IMAGE_URL}/thumb-print.png`,
    TERMS_OF_SERVICE: `${BUCKET_IMAGE_URL}/terms-of-service.png`,

    // PL_BY_ONDC: `${BUCKET_IMAGE_URL}/pl-by-ondc.svg`,
    CREDIT_CARD: `${BUCKET_IMAGE_URL}/credit-card-icon.png`,
    DOCUMENT: `${BUCKET_IMAGE_URL}/document-icon.png`,
    OTP: `${BUCKET_IMAGE_URL}/otp-icon.png`,
    WALLET: `${BUCKET_IMAGE_URL}/wallet-icon.png`,
    HOURGLASS: `${BUCKET_IMAGE_URL}/hourglass-icon.png`,
    IPL: `${BUCKET_IMAGE_URL}/ipl.png`,
  },
  PARTNERS: {
    BASE_PATH: `${BUCKET_IMAGE_URL}/partners`,
  },
  MEDIA: {
    MAGICBRICKS: '/assets/media/magicbricks.svg',
    IBS_INTELLIGENCE: '/assets/media/ibs-intelligence.png',
    INDIAN_STARTUP_NEWS: '/assets/media/indian-startup-news.png',
    SUGERMINT: '/assets/media/sugermint.png',
    MAKEMONEY: '/assets/media/makemoney.png',
    NDTV_PROFIT: '/assets/media/ndtv-profit.png',
    STARTUPTALKY: '/assets/media/startuptalky.png',
    JAGRAN: '/assets/media/jagran.png',
  },
  FEDERATION_BANK_REDIRECT: {
    WECREDIT_LOGO: `${BUCKET_IMAGE_URL}/wecredit-icon.png`,
    FEDERAL_BANK_LOGO: `${BUCKET_IMAGE_URL}/federation-bank-redirect-federal-bank-logo.png`,
    PROGRESS: `${BUCKET_IMAGE_URL}/federation-bank-redirect-progress.svg`,
  },
  ZAPCASH_SSO_REDIRECT: {
    WECREDIT_LOGO: `${BUCKET_IMAGE_URL}/wecredit-icon.png`,
    ZAPCASH_LOGO: `${BUCKET_IMAGE_URL}/ZapCash Logo Png 2.png`,
    PROGRESS: `${BUCKET_IMAGE_URL}/federation-bank-redirect-progress.svg`,
  },
} as const;
