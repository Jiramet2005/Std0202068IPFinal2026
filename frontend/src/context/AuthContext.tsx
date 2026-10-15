// Adapted from the original AuthProvider; the exam API returns a token.
import React, { createContext, useContext, useState } from 'react';
type AuthContextType = { token: string | null; login: (token: string) => void; logout: () => void };
const AuthContext = createContext<AuthContextType>({ token: null, login: () => {}, logout: () => {} });
export function useAuth() { return useContext(AuthContext); }
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  return <AuthContext.Provider value={{ token, login: setToken, logout: () => setToken(null) }}>{children}</AuthContext.Provider>;
}
