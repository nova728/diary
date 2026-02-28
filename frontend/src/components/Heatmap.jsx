import { useState, useEffect, useMemo } from "react";
import { memoriesApi } from "../api/memories";

const MONTHS = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];
const DAYS = ["", "一", "", "三", "", "五", ""];

// Color intensity based on entry count
function getColor(count) {
  if (count === 0) return "var(--heatmap-empty, #ebedf0)";
  if (count === 1) return "var(--heatmap-l1, #e0d4fc)";
  if (count === 2) return "var(--heatmap-l2, #b99ff5)";
  if (count <= 4) return "var(--heatmap-l3, #9b7ef0)";
  return "var(--heatmap-l4, #7c5cdb)";
}

export default function Heatmap({ year: propYear }) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [year, setYear] = useState(propYear || new Date().getFullYear());
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    memoriesApi.heatmap({ year }).then((res) => {
      setData(res.heatmap || []);
      setStats(res.stats || {});
    }).catch(() => {});
  }, [year]);

  // Build weeks grid (7 rows × ~53 cols)
  const weeks = useMemo(() => {
    if (!data.length) return [];

    const result = [];
    // Find what day of the week Jan 1 is (0=Sun, 6=Sat)
    const jan1 = new Date(`${year}-01-01`);
    const startDay = jan1.getDay();

    // Pad the first week with empty cells
    let currentWeek = new Array(startDay).fill(null);

    data.forEach((d) => {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad the last week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) currentWeek.push(null);
      result.push(currentWeek);
    }

    return result;
  }, [data, year]);

  // Month labels position
  const monthLabels = useMemo(() => {
    if (!data.length) return [];
    const labels = [];
    let weekIndex = 0;
    const jan1 = new Date(`${year}-01-01`);
    const startDay = jan1.getDay();
    let dayCount = 0;

    for (let w = 0; w < weeks.length; w++) {
      for (let d = 0; d < 7; d++) {
        const cell = weeks[w][d];
        if (cell) {
          const date = new Date(cell.date);
          if (date.getDate() === 1) {
            labels.push({ month: date.getMonth(), weekIndex: w });
          }
        }
      }
    }
    return labels;
  }, [weeks, year]);

  const cellSize = 12;
  const gap = 3;
  const labelOffsetX = 28;
  const monthLabelHeight = 16;
  const svgWidth = weeks.length * (cellSize + gap) + labelOffsetX + 4;
  const svgHeight = 7 * (cellSize + gap) + monthLabelHeight + 4;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", letterSpacing: "0.04em" }}>
          年度写作热力图
        </h3>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            onClick={() => setYear((y) => y - 1)}
            style={{
              border: "1px solid var(--border)", background: "var(--surface)", borderRadius: "6px",
              padding: "3px 10px", fontSize: "12px", cursor: "pointer", color: "var(--text-secondary)",
            }}
          >
            ←
          </button>
          <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", minWidth: "40px", textAlign: "center" }}>
            {year}
          </span>
          <button
            onClick={() => setYear((y) => y + 1)}
            style={{
              border: "1px solid var(--border)", background: "var(--surface)", borderRadius: "6px",
              padding: "3px 10px", fontSize: "12px", cursor: "pointer", color: "var(--text-secondary)",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Heatmap grid */}
      <div style={{ overflowX: "auto", position: "relative" }}>
        <svg width={svgWidth} height={svgHeight}>
          {/* Month labels — rendered inside SVG */}
          {monthLabels.map((m, i) => (
            <text
              key={i}
              x={labelOffsetX + m.weekIndex * (cellSize + gap)}
              y={11}
              fontSize="10"
              fill="var(--text-muted)"
            >
              {MONTHS[m.month]}
            </text>
          ))}

          {/* Day labels */}
          {DAYS.map((label, i) => (
            label && (
              <text
                key={i}
                x={0}
                y={monthLabelHeight + i * (cellSize + gap) + cellSize}
                fontSize="10"
                fill="var(--text-muted)"
              >
                {label}
              </text>
            )
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => (
              day && (
                <rect
                  key={`${wi}-${di}`}
                  x={labelOffsetX + wi * (cellSize + gap)}
                  y={monthLabelHeight + di * (cellSize + gap)}
                  width={cellSize}
                  height={cellSize}
                  rx={2}
                  fill={getColor(day.count)}
                  style={{ cursor: "pointer", transition: "opacity 0.1s" }}
                  onMouseEnter={(e) => {
                    setTooltip({
                      x: e.clientX,
                      y: e.clientY,
                      date: day.date,
                      count: day.count,
                      words: day.words,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              )
            ))
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x + 10,
              top: tooltip.y - 40,
              background: "var(--text-primary)",
              color: "var(--bg)",
              padding: "6px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: "500",
              pointerEvents: "none",
              zIndex: 100,
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {tooltip.date} · {tooltip.count} 篇 · {tooltip.words} 字
          </div>
        )}
      </div>

      {/* Legend + stats */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginTop: "12px", flexWrap: "wrap", gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "var(--text-muted)" }}>
          少
          {[0, 1, 2, 3, 5].map((n) => (
            <span
              key={n}
              style={{
                width: "11px", height: "11px", borderRadius: "2px",
                background: getColor(n), display: "inline-block",
              }}
            />
          ))}
          多
        </div>
        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
          {year}年共写 <b style={{ color: "var(--accent)" }}>{stats.totalEntries || 0}</b> 篇，
          活跃 <b style={{ color: "var(--accent)" }}>{stats.totalDays || 0}</b> 天，
          共 <b style={{ color: "var(--accent)" }}>{(stats.totalWords || 0).toLocaleString()}</b> 字
        </div>
      </div>
    </div>
  );
}
