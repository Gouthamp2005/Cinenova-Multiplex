import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "../lib/api";
import type { Profile } from "../types";

interface SimpleSession {
  user: { id: Profile["id"]; email: string };
}

interface AuthContextValue {
  session: SimpleSession | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SimpleSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ user: Profile }>("/api/auth/me")
      .then(({ user }) => {
        setProfile(user);
        setSession({ user: { id: user.id, email: user.email } });
      })
      .catch(() => {
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { token, user } = await api.post<{ token: string; user: Profile }>("/api/auth/login", {
      email,
      password,
    });
    setToken(token);
    setProfile(user);
    setSession({ user: { id: user.id, email: user.email } });
  };

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    const { token, user } = await api.post<{ token: string; user: Profile }>("/api/auth/register", {
      email,
      password,
      full_name: fullName,
      phone,
    });
    setToken(token);
    setProfile(user);
    setSession({ user: { id: user.id, email: user.email } });
  };

  const signOut = async () => {
    setToken(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
