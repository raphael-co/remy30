"use client";

import React from "react";

export type AuthUser = { id: string; name: string; role?: string };

export type AuthReview = {
  id: string;
  rating: number;
  message: string;
  imageUrl: string | null;
  createdAt: string;
};

export type AuthDefaults = {
  rating: number;
  message: string;
  imageUrl: string | null;
};

type AuthContextValue = {
  loading: boolean;
  user: AuthUser | null;
  isLoggedIn: boolean;

  review: AuthReview | null;
  defaults: AuthDefaults;

  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

type MeApiResponse =
  | { loggedIn: false }
  | {
      loggedIn: true;
      user: { id: string; name: string; role?: string };
      review: AuthReview | null;
      defaults: AuthDefaults;
    };

async function fetchMe(): Promise<{
  user: AuthUser | null;
  review: AuthReview | null;
  defaults: AuthDefaults;
}> {
  const res = await fetch("/api/auth/me", { cache: "no-store" });

  let json: MeApiResponse | null = null;
  try {
    json = (await res.json()) as MeApiResponse;
  } catch {
    json = null;
  }

  const emptyDefaults: AuthDefaults = { rating: 5, message: "", imageUrl: null };

  if (json && "loggedIn" in json && json.loggedIn && (json as any)?.user?.id) {
    const j = json as Extract<MeApiResponse, { loggedIn: true }>;

    return {
      user: { id: j.user.id, name: j.user.name, role: j.user.role },
      review: j.review ?? null,
      defaults: j.defaults ?? emptyDefaults,
    };
  }

  return { user: null, review: null, defaults: emptyDefaults };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<AuthUser | null>(null);

  const [review, setReview] = React.useState<AuthReview | null>(null);
  const [defaults, setDefaults] = React.useState<AuthDefaults>({
    rating: 5,
    message: "",
    imageUrl: null,
  });

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const { user, review, defaults } = await fetchMe();
      setUser(user);
      setReview(review);
      setDefaults(defaults);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = React.useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    await refresh();
  }, [refresh]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      loading,
      user,
      isLoggedIn: !!user,

      review,
      defaults,

      refresh,
      logout,
    }),
    [loading, user, review, defaults, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <AuthProvider>");
  }
  return ctx;
}
