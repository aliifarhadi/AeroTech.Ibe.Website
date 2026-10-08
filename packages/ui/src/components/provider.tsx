'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { I18nProvider } from 'react-aria-components';

/** Maps an app locale (`fa-ir`) to the BCP 47 tag that formatting and calendars expect (`fa-IR`). */
export function toBcp47(locale: string): string {
  const [language, region] = locale.split('-');
  return region ? `${language?.toLowerCase()}-${region.toUpperCase()}` : locale;
}

type ToastApi = { show: (message: string, durationMs?: number) => void };
const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error('useToast must be used inside <UiProvider>');
  return api;
}

/** Locale for every component below it, plus one polite toast region. */
export function UiProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((text: string, durationMs = 3600) => {
    if (timer.current) clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(null), durationMs);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return (
    <I18nProvider locale={toBcp47(locale)}>
      <ToastContext.Provider value={{ show }}>
        {children}
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-(--z-toast) flex justify-center px-4"
        >
          {message ? (
            <div className="max-w-xl animate-pop-in rounded-control bg-default px-4 py-3 text-small text-on-action shadow-overlay">
              {message}
            </div>
          ) : null}
        </div>
      </ToastContext.Provider>
    </I18nProvider>
  );
}

/** The locale and direction provided by `UiProvider`. */
export { useLocale } from 'react-aria-components';
