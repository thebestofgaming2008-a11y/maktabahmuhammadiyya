import { useAuthActions, useConvexAuth } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { api } from "../../convex/_generated/api";

type Profile = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  preferred_currency: string | null;
  marketing_consent: boolean | null;
};

type User = {
  id: string;
  email: string | null;
  name?: string | null;
  isAdmin?: boolean;
};

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  requestPasswordReset: (email: string) => Promise<{ error: Error | null }>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const pendingNameKey = "maktabah_pending_full_name";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { signIn: convexSignIn, signOut: convexSignOut } = useAuthActions();
  const ensureCurrentProfile = useMutation(api.users.ensureCurrentProfile);
  const currentUser = useQuery(api.users.currentUser, isAuthenticated ? {} : "skip");
  const currentProfile = useQuery(api.users.currentProfile, isAuthenticated ? {} : "skip");
  const ensuredUserRef = useRef<string | null>(null);

  const user = currentUser ?? null;
  const profile = currentProfile ?? null;
  const loading = isLoading || (isAuthenticated && currentUser === undefined);
  const isAdmin = Boolean(user?.isAdmin);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || ensuredUserRef.current === user.id) return;
    ensuredUserRef.current = user.id;
    const fullName = window.localStorage.getItem(pendingNameKey) ?? undefined;
    void ensureCurrentProfile({ fullName: fullName?.trim() || undefined })
      .then(() => window.localStorage.removeItem(pendingNameKey))
      .catch(() => {
        ensuredUserRef.current = null;
      });
  }, [ensureCurrentProfile, isAuthenticated, user?.id]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        await convexSignIn("password", {
          email: email.trim().toLowerCase(),
          password,
          flow: "signIn",
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error("Unable to sign in.") };
      }
    },
    [convexSignIn],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        if (fullName?.trim()) window.localStorage.setItem(pendingNameKey, fullName.trim());
        await convexSignIn("password", {
          email: email.trim().toLowerCase(),
          password,
          flow: "signUp",
        });
        return { error: null };
      } catch (err) {
        window.localStorage.removeItem(pendingNameKey);
        return { error: err instanceof Error ? err : new Error("Unable to create account.") };
      }
    },
    [convexSignIn],
  );

  const requestPasswordReset = useCallback(
    async (email: string) => {
      try {
        await convexSignIn("password", {
          email: email.trim().toLowerCase(),
          flow: "reset",
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error("Unable to send reset code.") };
      }
    },
    [convexSignIn],
  );

  const resetPassword = useCallback(
    async (email: string, code: string, newPassword: string) => {
      try {
        await convexSignIn("password", {
          email: email.trim().toLowerCase(),
          code: code.trim(),
          newPassword,
          flow: "reset-verification",
        });
        return { error: null };
      } catch (err) {
        return { error: err instanceof Error ? err : new Error("Unable to reset password.") };
      }
    },
    [convexSignIn],
  );

  const signOut = useCallback(async () => {
    await convexSignOut();
  }, [convexSignOut]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isAdmin,
      loading,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      signOut,
    }),
    [user, profile, isAdmin, loading, signIn, signUp, requestPasswordReset, resetPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
