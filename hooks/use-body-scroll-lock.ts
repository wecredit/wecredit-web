import { useEffect } from 'react';

let activeLockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let previousBodyPosition = '';
let previousBodyTop = '';
let previousBodyWidth = '';
let lockedScrollY = 0;

const lockScroll = (): void => {
  if (typeof document === 'undefined') return;
  if (activeLockCount === 0) {
    // Store current styles so we can restore them once all locks are released.
    // position:fixed is required on iOS — overflow:hidden alone still rubber-bands.
    previousBodyOverflow = document.body.style.overflow;
    previousHtmlOverflow = document.documentElement.style.overflow;
    previousBodyPosition = document.body.style.position;
    previousBodyTop = document.body.style.top;
    previousBodyWidth = document.body.style.width;
    lockedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.width = '100%';
  }
  activeLockCount += 1;
};

const unlockScroll = (): void => {
  if (typeof document === 'undefined') return;
  if (activeLockCount === 0) return;
  activeLockCount -= 1;
  if (activeLockCount === 0) {
    document.body.style.overflow = previousBodyOverflow;
    document.documentElement.style.overflow = previousHtmlOverflow;
    document.body.style.position = previousBodyPosition;
    document.body.style.top = previousBodyTop;
    document.body.style.width = previousBodyWidth;
    window.scrollTo(0, lockedScrollY);
  }
};

/**
 * Custom hook to lock/unlock body scroll
 * Prevents background scrolling when a modal or overlay is open
 *
 * @param isLocked - Whether body scroll should be locked
 */
export function useBodyScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    // Reference counting avoids fights when multiple modals overlap.
    lockScroll();
    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
