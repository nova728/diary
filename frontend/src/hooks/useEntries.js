import { useCallback } from "react";
import { entriesApi } from "../api/entries";
import { useEntryStore } from "../store/entryStore";

export function useEntries() {
  const { filters, setEntries, setLoading, setError, pagination } = useEntryStore();

  const fetchEntries = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);
      try {
        const data = await entriesApi.list({ ...filters, page });
        setEntries(data.entries, data.pagination);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load entries");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  return { fetchEntries };
}
