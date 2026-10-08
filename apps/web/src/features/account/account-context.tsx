'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@aerotech/ui';
import { useRouter } from '@/i18n/navigation';
import { AuthDialog } from './auth-dialog';

/**
 * Accounts for the V1 mocked build. Everything lives in memory for the life of the page: nothing
 * is sent to a server and nothing is written to browser storage, so a reload signs you out.
 * Replace the bodies of these functions with the identity API when it is connected.
 */
export type User = {
  key: string;
  first: string;
  last: string;
  nationalId: string;
  phone: string;
  email: string;
  password: string;
  sms: boolean;
  mail: boolean;
  push: boolean;
};

export type AuthStep = 'entry' | 'forgot' | 'verify' | 'profile' | 'newPassword';
export type AuthRequest = {
  step?: AuthStep;
  /** `set`: a signed-in user is choosing a password. */
  purpose?: 'login' | 'reset' | 'set';
  /** Go to the profile page after signing in. */
  thenProfile?: boolean;
};

type AccountContextValue = {
  user: User | null;
  openAuth: (request?: AuthRequest) => void;
  signOut: () => void;
  updateUser: (patch: Partial<User>) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccount(): AccountContextValue {
  const value = useContext(AccountContext);
  if (!value) throw new Error('useAccount must be used inside <AccountProvider>');
  return value;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('account.toasts');
  const toast = useToast();
  const router = useRouter();
  const accounts = useRef(new Map<string, User>());
  const [user, setUser] = useState<User | null>(null);
  const [request, setRequest] = useState<AuthRequest | null>(null);

  const openAuth = useCallback((next: AuthRequest = {}) => setRequest(next), []);

  const signOut = useCallback(() => {
    setUser(null);
    toast.show(t('loggedOut'));
    router.push('/');
  }, [router, t, toast]);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      accounts.current.set(next.key, next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ user, openAuth, signOut, updateUser }),
    [user, openAuth, signOut, updateUser],
  );

  return (
    <AccountContext.Provider value={value}>
      {children}
      {request ? (
        <AuthDialog
          request={request}
          user={user}
          findAccount={(key) => accounts.current.get(key)}
          onClose={() => setRequest(null)}
          onPasswordReset={(key, password) => {
            const account = accounts.current.get(key);
            if (account) accounts.current.set(key, { ...account, password });
            toast.show(t('passwordChanged'));
          }}
          onPasswordSet={(password) => {
            updateUser({ password });
            setRequest(null);
            toast.show(t('passwordSaved'));
          }}
          onSignIn={(account, created) => {
            accounts.current.set(account.key, account);
            setUser(account);
            setRequest(null);
            toast.show(t(created ? 'created' : 'welcome', { name: account.first }));
            if (request.thenProfile) router.push('/account');
          }}
        />
      ) : null}
    </AccountContext.Provider>
  );
}

export function initials(user: Pick<User, 'first' | 'last'>): string {
  const letters = [user.first, user.last].map((part) => part.trim().charAt(0)).filter(Boolean);
  // A zero-width non-joiner keeps two Persian initials from joining into one glyph.
  return letters.join('‌') || '•';
}
