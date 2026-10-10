import { LenderOfferStatus } from "@/types/wecredit";
import { normalizeLenderNameForMatch } from "./lenders";
import { ReadonlyURLSearchParams } from "next/navigation";

/** Same rule as phone step: 10 digits starting with 6–9 (India mobile). */
export const isValidMobile = (mobile: string | null): mobile is string => {
    if (!mobile) return false;
    const trimmed = mobile.trim();
    return /^[6-9]\d{9}$/.test(trimmed);
};

export const parseAmountToNumber = (amount: string | number | undefined): number => {
    if (!amount) return 0;

    const value = String(amount).toLowerCase().trim();

    // Handle lakh / lakhs
    if (value.includes('lakh')) {
        const numeric = parseFloat(value.replace(/[^\d.]/g, ''));
        return isNaN(numeric) ? 0 : numeric * 100000;
    }

    // Handle normal numbers like 50000 or ₹1,20,000
    const numeric = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(numeric) ? 0 : numeric;
};


export const mapingLenderNameToLenderCode = (lenderName: string): string => {
    switch (lenderName) {
        case 'lnt':
            return 'L&T';
        case 'upswing_lnt':
            return 'Upswing L&T';
        case 'upswing_dmi':
            return 'DMI';
        default:
            return lenderName;
    }
};

export const isLnt = (nameOrId?: string | null): boolean => {
    if (!nameOrId) return false;
    const normalized = nameOrId.toLowerCase().trim();
    return (
        normalized === 'lnt' ||
        normalized === 'upswing_lnt'
    );
};

export const isUpswingRedirectAllowed = (lenderName: string): boolean => {
    return lenderName.toLowerCase() === 'lnt' || lenderName.toLowerCase() === 'upswing_lnt' || lenderName.toLowerCase() === 'upswing_dmi';
};

export const isFederationBank = (lenderName: string): boolean => {
    return lenderName.toLowerCase() === 'federalbank';
};

export const isZapcash = (lenderName: string): boolean => {
    return lenderName.toLowerCase() === 'zapcash';
};

export function hasMatchingStatusLender(lenders: LenderOfferStatus[], lenderName: string): boolean {
    const normalizedLenderName = normalizeLenderNameForMatch(lenderName);
    if (!normalizedLenderName) {
        return false;
    }

    return lenders.some((lender) => normalizeLenderNameForMatch(lender.lenderName ?? '') === normalizedLenderName);
}

export const getLenderNameFromUrl = (searchParams: ReadonlyURLSearchParams, lendernameFromStore?: string): string => {
    return (searchParams?.get('lenderName') ?? searchParams?.get('lendername') ?? searchParams?.get('lender_name') ?? lendernameFromStore ?? '')
        .trim()
        .toLowerCase()
}

export const formatToTwoDecimals = (amount: string | number | undefined): string => {
    if (!amount) return '0';

    const value = String(amount).toLowerCase().trim();

    const numeric = parseFloat(value.replace(/[^\d.]/g, ''));
    return isNaN(numeric) ? '0' : numeric.toFixed(2);
}