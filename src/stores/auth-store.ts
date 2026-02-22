'use client';

import { create } from 'zustand';

type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
};

type AuthState = {
  user: AuthUser | null;
  teacherProfileId: string | null;
  notificationCount: number;
};

type AuthActions = {
  setUser: (user: AuthUser) => void;
  setTeacherProfileId: (id: string | null) => void;
  setNotificationCount: (count: number) => void;
  decrementNotificationCount: () => void;
  reset: () => void;
};

const initialState: AuthState = {
  user: null,
  teacherProfileId: null,
  notificationCount: 0,
};

export const useAuthStore = create<AuthState & AuthActions>()((set) => ({
  ...initialState,

  setUser: (user) => set({ user }),

  setTeacherProfileId: (id) => set({ teacherProfileId: id }),

  setNotificationCount: (count) => set({ notificationCount: count }),

  decrementNotificationCount: () =>
    set((s) => ({ notificationCount: Math.max(0, s.notificationCount - 1) })),

  reset: () => set(initialState),
}));
