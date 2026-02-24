import { create } from "zustand";

export const useEntryStore = create((set) => ({
  entries: [],
  pagination: { total: 0, page: 1, limit: 20, pages: 0 },
  filters: { search: "", mood: "", tag: "", sortBy: "date", order: "desc" },
  loading: false,
  error: null,

  setEntries: (entries, pagination) => set({ entries, pagination }),

  setFilters: (filters) =>
    set((s) => ({ filters: { ...s.filters, ...filters } })),

  addEntry: (entry) =>
    set((s) => ({ entries: [entry, ...s.entries] })),

  updateEntry: (updated) =>
    set((s) => {
      const entries = s.entries
        .map((e) => (e.id === updated.id ? updated : e))
        .sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;

          const { sortBy = "date", order = "desc" } = s.filters;
          const field = sortBy === "createdAt" ? "createdAt" : sortBy === "wordCount" ? "wordCount" : "date";
          const dir = order === "asc" ? 1 : -1;

          const av = a[field];
          const bv = b[field];
          if (av === bv) return 0;
          return av > bv ? dir : -dir;
        });

      return { entries };
    }),

  removeEntry: (id) =>
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
