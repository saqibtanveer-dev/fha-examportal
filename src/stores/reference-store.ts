'use client';

import { create } from 'zustand';

/**
 * Reference data store — subjects, classes, academic sessions, tags.
 * This data rarely changes and is shared across multiple pages.
 * Hydrated once at layout level, used everywhere.
 */

export type RefSubject = { id: string; name: string; code: string };
export type RefClass = { id: string; name: string; sections: { id: string; name: string }[] };
export type RefAcademicSession = { id: string; name: string; isCurrent: boolean };
export type RefTag = { id: string; name: string; category: string; _count: { questionTags: number } };
export type RefSubjectClassLink = {
  subjectId: string;
  classId: string;
  className: string;
  isElective: boolean;
  electiveGroupName: string | null;
};

type ReferenceState = {
  subjects: RefSubject[];
  classes: RefClass[];
  academicSessions: RefAcademicSession[];
  tags: RefTag[];
  subjectClassLinks: RefSubjectClassLink[];
  _hydratedAt: number | null;
};

type ReferenceActions = {
  hydrate: (data: Partial<ReferenceState>) => void;
  isStale: () => boolean;
  invalidate: () => void;
};

const STALE_TIME = 10 * 60 * 1000; // 10 minutes

const initialState: ReferenceState = {
  subjects: [],
  classes: [],
  academicSessions: [],
  tags: [],
  subjectClassLinks: [],
  _hydratedAt: null,
};

export const useReferenceStore = create<ReferenceState & ReferenceActions>()(
  (set, get) => ({
    ...initialState,

    hydrate: (data) => {
      const current = get();
      // Only rehydrate if stale or not yet hydrated
      if (current._hydratedAt && !current.isStale()) return;
      set({ ...data, _hydratedAt: Date.now() });
    },

    isStale: () => {
      const hydratedAt = get()._hydratedAt;
      if (!hydratedAt) return true;
      return Date.now() - hydratedAt > STALE_TIME;
    },

    invalidate: () => set({ _hydratedAt: null }),
  }),
);
