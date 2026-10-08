'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import {
  createTripDraft,
  draftFromQuery,
  NETWORK_ROUTES,
  tripReducer,
  type TripAction,
  type TripDraft,
} from '@aerotech/domain';
import { getLocalTimeZone, today, useToast } from '@aerotech/ui';
import { moodForHour, nextMood, tehranHour, type Mood } from './scene-mood';

export type BookingTab = 'book' | 'manage' | 'checkIn' | 'status';
export const BOOKING_ID = 'book';
export const ASSISTANT_ID = 'assistant';

type HomeContextValue = {
  tab: BookingTab;
  setTab: (tab: BookingTab) => void;
  /** Null until the browser has told us what day it is (the page is static HTML). */
  draft: TripDraft | null;
  dispatch: Dispatch<TripAction>;
  /** Index into NETWORK_ROUTES of the route the network section is showing. */
  activeRoute: number;
  routePicked: boolean;
  setActiveRoute: (index: number, byUser?: boolean) => void;
  /** Null until mounted, for the same reason as `draft`. */
  mood: Mood | null;
  moodPinned: boolean;
  cycleMood: () => void;
  /** Bring the booking card into view on the given tab. */
  focusBooking: (tab: BookingTab) => void;
  /** Start a booking to this city from a tile, the map or a link. */
  chooseDestination: (code: string) => void;
  assistantPrompt: { id: number; text: string } | null;
  askAssistant: (text: string) => void;
};

const HomeContext = createContext<HomeContextValue | null>(null);

export function useHome(): HomeContextValue {
  const value = useContext(HomeContext);
  if (!value) throw new Error('useHome must be used inside <HomeProvider>');
  return value;
}

/** For shell components that also render on pages without the booking card. */
export function useOptionalHome(): HomeContextValue | null {
  return useContext(HomeContext);
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const header = parseFloat(getComputedStyle(document.documentElement).fontSize) * 4;
  const top = el.getBoundingClientRect().top + window.scrollY - header - 12;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: Math.max(0, top), behavior: reduced ? 'auto' : 'smooth' });
}

type DraftAction = TripAction | { type: 'start'; today: string; initial: TripDraft | null };

function draftReducer(draft: TripDraft | null, action: DraftAction): TripDraft | null {
  if (action.type === 'start') return draft ?? action.initial ?? createTripDraft(action.today);
  return draft ? tripReducer(draft, action) : draft;
}

const TABS: readonly BookingTab[] = ['book', 'manage', 'checkIn', 'status'];

export function HomeProvider({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const toast = useToast();
  const [tab, setTab] = useState<BookingTab>('book');
  const [draft, dispatch] = useReducer(draftReducer, null);
  const [route, setRoute] = useState({ index: 0, picked: false });
  const [mood, setMood] = useState<{ value: Mood | null; pinned: boolean }>({
    value: null,
    pinned: false,
  });
  const [assistantPrompt, setAssistantPrompt] = useState<{ id: number; text: string } | null>(null);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    // "Edit search" on the results page links back here with the search in the query.
    dispatch({
      type: 'start',
      today: today(getLocalTimeZone()).toString(),
      initial: draftFromQuery(query),
    });
    const requested = query.get('tab');
    const match = TABS.find((name) => name === requested);
    if (match) setTab(match);

    const follow = () =>
      setMood((current) =>
        current.pinned ? current : { value: moodForHour(tehranHour()), pinned: false },
      );
    follow();
    const timer = window.setInterval(follow, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const setActiveRoute = useCallback((index: number, byUser = false) => {
    const count = NETWORK_ROUTES.length;
    setRoute((current) => ({
      index: ((index % count) + count) % count,
      picked: current.picked || byUser,
    }));
  }, []);

  const focusBooking = useCallback((next: BookingTab) => {
    setTab(next);
    scrollToId(BOOKING_ID);
  }, []);

  const chooseDestination = useCallback(
    (code: string) => {
      const index = NETWORK_ROUTES.findIndex((item) => item.code === code);
      if (index < 0) return;
      setTab('book');
      dispatch({ type: 'setDestination', code });
      setRoute({ index, picked: true });
      toast.show(t('booking.destinationSet', { city: t(`cities.${code}.name`) }));
      const card = document.getElementById(BOOKING_ID)?.getBoundingClientRect();
      if (card && (card.top < 70 || card.top > window.innerHeight * 0.6)) scrollToId(BOOKING_ID);
    },
    [t, toast],
  );

  const cycleMood = useCallback(() => {
    setMood((current) => ({ value: nextMood(current.value ?? 'dawn'), pinned: true }));
  }, []);

  const askAssistant = useCallback((text: string) => {
    setAssistantPrompt((current) => ({ id: (current?.id ?? 0) + 1, text }));
    scrollToId(ASSISTANT_ID);
  }, []);

  const value = useMemo<HomeContextValue>(
    () => ({
      tab,
      setTab,
      draft,
      dispatch,
      activeRoute: route.index,
      routePicked: route.picked,
      setActiveRoute,
      mood: mood.value,
      moodPinned: mood.pinned,
      cycleMood,
      focusBooking,
      chooseDestination,
      assistantPrompt,
      askAssistant,
    }),
    [
      tab,
      draft,
      route,
      mood,
      assistantPrompt,
      setActiveRoute,
      cycleMood,
      focusBooking,
      chooseDestination,
      askAssistant,
    ],
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}
