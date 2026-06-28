import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

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

const demoUser: User = {
  id: "lovable-demo-admin",
  email: "demo@maktabahmuhammadiya.local",
  name: "Demo Admin",
  isAdmin: true,
};

const demoProfile: Profile = {
  id: "lovable-demo-profile",
  user_id: demoUser.id,
  email: demoUser.email,
  full_name: demoUser.name ?? "Demo Admin",
  phone: "",
  preferred_currency: "INR",
  marketing_consent: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(demoUser);

  const signIn = useCallback(async (email: string) => {
    setUser({
      ...demoUser,
      email: email.trim().toLowerCase() || demoUser.email,
      name: email.trim() || demoUser.name,
    });
    return { error: null };
  }, []);

  const signUp = useCallback(async (email: string, _password: string, fullName?: string) => {
    setUser({
      ...demoUser,
      email: email.trim().toLowerCase() || demoUser.email,
      name: fullName?.trim() || email.trim() || demoUser.name,
    });
    return { error: null };
  }, []);

  const requestPasswordReset = useCallback(async () => ({ error: null }), []);
  const resetPassword = useCallback(async () => ({ error: null }), []);
  const signOut = useCallback(async () => setUser(null), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile: user ? { ...demoProfile, email: user.email, full_name: user.name ?? user.email } : null,
      isAdmin: Boolean(user?.isAdmin),
      loading: false,
      signIn,
      signUp,
      requestPasswordReset,
      resetPassword,
      signOut,
    }),
    [requestPasswordReset, resetPassword, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
