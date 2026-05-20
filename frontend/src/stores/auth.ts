import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'EDITOR';

export interface AuthUser {
  id: number;
  email: string;
  fullName: string;
  role: Role;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'cms-auth' },
  ),
);

export function hasRole(user: AuthUser | null, allowed: Role[]): boolean {
  if (!user) return false;
  return allowed.includes(user.role);
}
