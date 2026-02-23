import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, isSameMonth, addMonths, subMonths,
} from "date-fns";
import { zhCN } from "date-fns/locale";
import { entriesApi } from "../api/entries";
import { LoaderIcon } from "../components/icons";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

export default function CalendarPage() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(new Date());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startDate = format(startOfMonth(current), "yyyy-MM-dd");
    const endDate = format(endOfMonth(current), "yyyy-MM-dd");
    setLoading(true);
    entriesApi
      .list({ startDate, endDate, limit: 100 })
      .then((data) => setEntries(data.entries))
      .finally(() => setLoading(false));
  }, [current]);

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) });
  const startPad = getDay(startOfMonth(current)); // 0=Sun

  // Build a map of date -> entries
  const entryMap = {};
  entries.forEach((e) => {
    const key = e.date.slice(0, 10);
    if (!entryMap[key]) entryMap[key] = [];
    entryMap[key].push(e);
  });

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>
          日历
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setCurrent(subMonths(current, 1))} style={navBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span style={{ fontSize: "16px", fontWeight: "600", color: "var(--text-primary)", minWidth: "100px", textAlign: "center" }}>
            {format(current, "yyyy年M月", { locale: zhCN })}
          </span>
          <button onClick={() => setCurrent(addMonths(current, 1))} style={navBtn}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button onClick={() => setCurrent(new Date())} style={{
            padding: "5px 12px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--text-secondary)", fontSize: "12px", cursor: "pointer",
          }}>今天</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
          <LoaderIcon size={22} color="var(--accent)" />
        </div>
      ) : (
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)", overflow: "hidden",
        }}>
          {/* Weekday headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
            {WEEKDAYS.map((d) => (
              <div key={d} style={{
                padding: "10px 0", textAlign: "center",
                fontSize: "12px", fontWeight: "600", color: "var(--text-muted)",
              }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {/* Padding cells */}
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} style={{ padding: "12px", minHeight: "80px", borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "var(--surface-2)" }} />
            ))}

            {days.map((day, idx) => {
              const key = format(day, "yyyy-MM-dd");
              const dayEntries = entryMap[key] || [];
              const hasEntry = dayEntries.length > 0;
              const today = isToday(day);
              const col = (startPad + idx) % 7;

              return (
                <div
                  key={key}
                  style={{
                    padding: "10px 8px",
                    minHeight: "80px",
                    borderRight: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                    background: today ? "var(--accent-subtle)" : "var(--surface)",
                    cursor: hasEntry ? "pointer" : "default",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => { if (hasEntry) e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = today ? "var(--accent-subtle)" : "var(--surface)"; }}
                  onClick={() => {
                    if (dayEntries.length === 1) navigate(`/entry/${dayEntries[0].id}`);
                  }}
                >
                  {/* Day number */}
                  <div style={{
                    width: "26px", height: "26px", borderRadius: "50%",
                    background: today ? "var(--accent)" : "transparent",
                    color: today ? "white" : col === 0 ? "var(--danger)" : "var(--text-primary)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: today ? "700" : "400",
                    marginBottom: "4px",
                  }}>
                    {format(day, "d")}
                  </div>

                  {/* Entry dots/titles */}
                  {dayEntries.slice(0, 2).map((e) => (
                    <div key={e.id} style={{
                      fontSize: "11px", lineHeight: "1.3",
                      color: "var(--accent-text)",
                      background: "var(--accent-subtle)",
                      borderRadius: "3px", padding: "1px 5px",
                      marginBottom: "2px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {e.title}
                    </div>
                  ))}
                  {dayEntries.length > 2 && (
                    <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>+{dayEntries.length - 2} 篇</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      <p style={{ marginTop: "16px", fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
        本月已记录 {entries.length} 篇日记
      </p>
    </div>
  );
}

const navBtn = {
  width: "30px", height: "30px", borderRadius: "var(--radius-sm)",
  border: "1px solid var(--border)", background: "transparent",
  color: "var(--text-secondary)", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
};
