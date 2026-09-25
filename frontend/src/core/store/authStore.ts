import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { SessionUser } from '@/types/user'

export const AUTH_STORAGE_KEY = 'riqchariy-auth'

interface AuthState {
  token: string | null
  user: SessionUser | null
  /** Epoch en ms. null = sin expiración conocida. */
  expiresAt: number | null
  setSession: (session: { token: string; user: SessionUser; expiresIn?: number }) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      expiresAt: null,
      setSession: ({ token, user, expiresIn }) =>
        set({
          token,
          user,
          expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : null,
        }),
      logout: () => set({ token: null, user: null, expiresAt: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user, expiresAt }) => ({ token, user, expiresAt }),
    },
  ),
)

/** true si hay token y no expiró. */
export function hasValidSession(state: Pick<AuthState, 'token' | 'expiresAt'>, now = Date.now()) {
  if (!state.token) return false
  return state.expiresAt === null || state.expiresAt > now
}
