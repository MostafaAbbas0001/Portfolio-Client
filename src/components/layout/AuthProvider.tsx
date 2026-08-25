import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getCurrentUser, login as loginRequest, type AuthUser } from "@/api/authApi";
import { AuthContext, type AuthContextValue } from "@/lib/auth-context";

const TOKEN_STORAGE_KEY = "portfolio-auth-token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    getCurrentUser(storedToken)
      .then(setUser)
      .catch(() => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      loading,
      isAuthenticated: Boolean(token && user),
      login: async (email, password) => {
        const response = await loginRequest(email, password);
        window.localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
        setToken(response.token);
        setUser({ email: response.email });
      },
      logout: () => {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      },
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
