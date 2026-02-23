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
    set((s) => ({
      entries: s.entries.map((e) => (e.id === updated.id ? updated : e)),
    })),

  removeEntry: (id) =>
    set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
