"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "@/lib/api";
import type { User } from "@/types/auth";

const AuthContext = createContext<{ user: User | null; refresh: () => Promise<void> }>({
  user: null,
  refresh: async () => undefined,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = async () => {
    const me = await authApi.me();
    setUser(me);
    setLoaded(true);
  };

  useEffect(() => {
    refresh();
  }, []);

  if (!loaded) return null; // Show loading state

  return (
    <AuthContext.Provider value={{ user, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
