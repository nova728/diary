import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      setAuth: ({ user, token, refreshToken }) =>
        set({ user, token, refreshToken }),

      setToken: (token) => set({ token }),

      setUser: (user) => set({ user }),

      logout: () => set({ user: null, token: null, refreshToken: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "diary-auth",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
