import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEntryStore } from "../store/entryStore";
import { useEntries } from "../hooks/useEntries";
import EntryCard from "../components/EntryCard";
import MemoryCards from "../components/MemoryCards";
import WritingGoalWidget from "../components/WritingGoalWidget";
import { PlusIcon, SearchIcon, FilterIcon, LoaderIcon } from "../components/icons";
import Select from "../components/Select";

const MOODS = [
  { value: "", label: "全部" },
  { value: "happy", label: "开心" },
  { value: "calm", label: "平静" },
  { value: "sad", label: "难过" },
  { value: "anxious", label: "焦虑" },
  { value: "excited", label: "兴奋" },
  { value: "grateful", label: "感恩" },
  { value: "tired", label: "疲惫" },
];

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { entries, pagination, filters, setFilters, loading, error } = useEntryStore();
  const { fetchEntries } = useEntries();
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debouncedSearch = useDebounce(searchInput, 400);

  useEffect(() => {
    setFilters({ search: debouncedSearch });
  }, [debouncedSearch]);

  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const availableTags = useMemo(() => {
    const set = new Map();
    entries.forEach((e) => {
      (e.tags || []).forEach((t) => {
        if (!set.has(t.name)) set.set(t.name, t.id || t.name);
      });
    });
    return [{ value: "", label: "全部标签" }, ...Array.from(set.keys()).map((name) => ({ value: name, label: `#${name}` }))];
  }, [entries]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>
            我的日记
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            共 {pagination.total} 篇记录
          </p>
        </div>
        <button
          onClick={() => navigate("/new")}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", borderRadius: "var(--radius-md)", border: "none",
            background: "var(--accent)", color: "white",
            fontSize: "14px", fontWeight: "600", cursor: "pointer",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent)"; }}
        >
          <PlusIcon size={16} color="white" />
          写日记
        </button>
      </div>

      {/* Search & Filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <SearchIcon
            size={15}
            color="var(--text-muted)"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="搜索标题、内容…"
            style={{
              width: "100%", padding: "9px 12px 9px 34px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-primary)", fontSize: "14px", outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
          />
        </div>

        {/* Mood filter */}
        <Select
          value={filters.mood}
          onChange={(v) => setFilters({ mood: v })}
          options={MOODS}
        />

        <Select
          compact
          value={filters.tag || ""}
          onChange={(v) => setFilters({ tag: v })}
          options={availableTags}
        />

        {/* Sort */}
        <Select
          compact
          value={`${filters.sortBy}-${filters.order}`}
          onChange={(v) => {
            const [sortBy, order] = v.split("-");
            setFilters({ sortBy, order });
          }}
          options={[
            { value: "date-desc", label: "最新优先" },
            { value: "date-asc", label: "最旧优先" },
            { value: "wordCount-desc", label: "字数最多" },
          ]}
        />
      </div>

      {/* Content */}
      {/* Memory Cards — on this day + random */}
      <MemoryCards />

      {/* Writing Goal Progress */}
      <WritingGoalWidget />

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", color: "var(--text-muted)" }}>
          <LoaderIcon size={24} color="var(--accent)" />
        </div>
      ) : error ? (
        <div style={{
          padding: "16px", borderRadius: "var(--radius-md)",
          background: "var(--danger-subtle)", color: "var(--danger)", fontSize: "14px",
        }}>
          {error}
        </div>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{
            width: "60px", height: "60px",
            border: "1.5px solid var(--border-strong)",
            borderRadius: "var(--radius-lg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <line x1="9" y1="15" x2="15" y2="15" />
            </svg>
          </div>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)", marginBottom: "6px" }}>
            {filters.search || filters.mood ? "没有找到匹配的日记" : "还没有日记"}
          </p>
          <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
            {filters.search || filters.mood ? "试着清除筛选条件" : "写下你的第一篇日记吧"}
          </p>
        </div>
      ) : (
        <>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => fetchEntries(p)}
                  style={{
                    width: "34px", height: "34px", borderRadius: "var(--radius-sm)",
                    border: "1px solid",
                    borderColor: p === pagination.page ? "var(--accent)" : "var(--border)",
                    background: p === pagination.page ? "var(--accent)" : "var(--surface)",
                    color: p === pagination.page ? "white" : "var(--text-secondary)",
                    fontSize: "13px", cursor: "pointer", fontWeight: "500",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
