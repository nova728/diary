import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoriesApi } from "../api/memories";
import { LoaderIcon } from "../components/icons";
import Select from "../components/Select";

const MOOD_MAP = {
  happy: { label: "开心", emoji: "😊" },
  calm: { label: "平静", emoji: "😌" },
  sad: { label: "难过", emoji: "😢" },
  angry: { label: "愤怒", emoji: "😤" },
  anxious: { label: "焦虑", emoji: "😰" },
  excited: { label: "兴奋", emoji: "🤩" },
  grateful: { label: "感恩", emoji: "🙏" },
  tired: { label: "疲惫", emoji: "😴" },
};

const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

// Strip HTML for preview
const toPlainText = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

function TimelineEntry({ entry }) {
  const navigate = useNavigate();
  const mood = entry.mood ? MOOD_MAP[entry.mood] : null;
  const preview = toPlainText(entry.content).slice(0, 100);
  const date = new Date(entry.date);

  return (
    <div
      onClick={() => navigate(`/entry/${entry.id}`)}
      style={{
        display: "flex",
        gap: "16px",
        cursor: "pointer",
        padding: "16px",
        borderRadius: "var(--radius-lg)",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--surface-2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Date badge */}
      <div style={{
        flexShrink: 0,
        width: "48px",
        textAlign: "center",
      }}>
        <div style={{
          fontSize: "24px", fontWeight: "700", color: "var(--text-primary)",
          fontFamily: "var(--font-serif)", lineHeight: 1,
        }}>
          {date.getDate()}
        </div>
        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
          {["日", "一", "二", "三", "四", "五", "六"][date.getDay()]}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <h3 style={{
            fontSize: "15px", fontWeight: "600", color: "var(--text-primary)",
            fontFamily: "var(--font-serif)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {entry.title}
          </h3>
          {mood && (
            <span style={{ fontSize: "14px", flexShrink: 0 }} title={mood.label}>
              {mood.emoji}
            </span>
          )}
        </div>
        {preview && (
          <p style={{
            fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.5,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {preview}
          </p>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "6px" }}>
          {entry.wordCount > 0 && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              {entry.wordCount} 字
            </span>
          )}
          {(entry.tags || []).map((t) => (
            <span
              key={t.id}
              style={{
                fontSize: "10px", padding: "1px 6px", borderRadius: "4px",
                background: "var(--accent-subtle)", color: "var(--accent)", fontWeight: "500",
              }}
            >
              #{t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function MonthGroup({ yearMonth, entries }) {
  const [y, m] = yearMonth.split("-").map(Number);

  return (
    <div style={{ marginBottom: "8px" }}>
      {/* Month header */}
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "12px 0", marginBottom: "4px",
      }}>
        <div style={{
          width: "10px", height: "10px", borderRadius: "50%",
          background: "var(--accent)", flexShrink: 0,
        }} />
        <h2 style={{
          fontSize: "16px", fontWeight: "700", color: "var(--text-primary)",
          fontFamily: "var(--font-serif)",
        }}>
          {y}年 {MONTH_NAMES[m - 1]}
        </h2>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {entries.length} 篇
        </span>
        <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
      </div>

      {/* Entries */}
      <div style={{
        borderLeft: "2px solid var(--border)",
        marginLeft: "4px",
        paddingLeft: "20px",
      }}>
        {entries.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [timeline, setTimeline] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  const loadTimeline = async (year, page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 50 };
      if (year) params.year = year;
      const data = await memoriesApi.timeline(params);
      setTimeline(data.timeline || []);
      setYears(data.years || []);
      setPagination(data.pagination || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline(selectedYear);
  }, [selectedYear]);

  const yearOptions = [
    { value: "", label: "全部年份" },
    ...years.map((y) => ({ value: String(y), label: `${y}年` })),
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-serif)", fontSize: "26px",
            fontWeight: "700", color: "var(--text-primary)",
          }}>
            时间线
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            {pagination.total || 0} 篇日记的时光之旅
          </p>
        </div>
        <Select
          value={selectedYear}
          onChange={(v) => setSelectedYear(v)}
          options={yearOptions}
        />
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <LoaderIcon size={24} color="var(--accent)" />
        </div>
      ) : timeline.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <div style={{ fontSize: "40px", marginBottom: "16px" }}>📭</div>
          <p style={{ fontSize: "15px", color: "var(--text-secondary)" }}>
            {selectedYear ? `${selectedYear}年还没有日记` : "还没有日记"}
          </p>
        </div>
      ) : (
        <>
          {timeline.map((group) => (
            <MonthGroup
              key={group.yearMonth}
              yearMonth={group.yearMonth}
              entries={group.entries}
            />
          ))}

          {/* Load more */}
          {pagination.page < pagination.pages && (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => loadTimeline(selectedYear, pagination.page + 1)}
                style={{
                  padding: "10px 28px", borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--text-secondary)", fontSize: "13px",
                  cursor: "pointer", fontWeight: "500",
                }}
              >
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
