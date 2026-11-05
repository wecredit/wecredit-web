'use client';

import { useCallback, useEffect, useRef } from 'react';

interface UseCloseOnBrowserBackOptions {
  isOpen: boolean;
  onClose: () => void;
  /** Unique flag written onto `history.state` for this modal instance. */
  historyKey: string;
}

interface UseCloseOnBrowserBackResult {
  /** UI dismiss: pops our history entry so browser back stays in sync. */
  requestClose: () => void;
}

const hasHistoryFlag = (state: unknown, historyKey: string): boolean => {
  if (typeof state !== 'object' || state === null) {
    return false;
  }
  return (state as Record<string, unknown>)[historyKey] === true;
};

/**
 * Makes browser Back close an open modal instead of leaving the page.
 * Opens push a history entry; Back / requestClose both consume that entry.
 */
export function useCloseOnBrowserBack({
  isOpen,
  onClose,
  historyKey,
}: UseCloseOnBrowserBackOptions): UseCloseOnBrowserBackResult {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;

  const hasPushedEntryRef = useRef(false);
  const closedByPopStateRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    closedByPopStateRef.current = false;

    if (!hasPushedEntryRef.current) {
      const nextState = {
        ...(typeof window.history.state === 'object' && window.history.state !== null
          ? window.history.state
          : {}),
        [historyKey]: true,
      };
      window.history.pushState(nextState, '', window.location.href);
      hasPushedEntryRef.current = true;
    }

    const handlePopState = (): void => {
      hasPushedEntryRef.current = false;
      closedByPopStateRef.current = true;
      if (isOpenRef.current) {
        onCloseRef.current();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [historyKey, isOpen]);

  // Programmatic close (redirect/error) still leaves our pushed entry — pop it.
  useEffect(() => {
    if (isOpen) {
      return;
    }
    if (closedByPopStateRef.current) {
      closedByPopStateRef.current = false;
      return;
    }
    if (!hasPushedEntryRef.current) {
      return;
    }
    hasPushedEntryRef.current = false;
    if (hasHistoryFlag(window.history.state, historyKey)) {
      window.history.back();
    }
  }, [historyKey, isOpen]);

  const requestClose = useCallback((): void => {
    if (isOpenRef.current && hasHistoryFlag(window.history.state, historyKey)) {
      window.history.back();
      return;
    }
    onCloseRef.current();
  }, [historyKey]);

  return { requestClose };
}
