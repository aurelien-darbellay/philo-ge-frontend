import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError } from "./api";
import type { AuthPayload, User } from "./types";

type AuthContextValue = {
  user: User | null;
  csrfToken: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  acceptInvitation: (
    token: string,
    username: string,
    password: string,
    confirmation: string,
    rememberMe: boolean,
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const applyAuth = (payload: AuthPayload) => {
    setUser(payload.user);
    setCsrfToken(payload.csrf_token);
  };

  useEffect(() => {
    api
      .me()
      .then(applyAuth)
      .catch((error: unknown) => {
        if (!(error instanceof ApiError) || error.status !== 401) {
          console.error("Could not restore authentication", error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      csrfToken,
      loading,
      login: async (email, password, rememberMe) => applyAuth(await api.login(email, password, rememberMe)),
      acceptInvitation: async (token, username, password, confirmation, rememberMe) =>
        applyAuth(await api.acceptInvitation(token, username, password, confirmation, rememberMe)),
      logout: async () => {
        if (csrfToken) await api.logout(csrfToken);
        setUser(null);
        setCsrfToken(null);
      },
    }),
    [user, csrfToken, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
