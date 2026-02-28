import { useEffect, useState } from "react";
import { achievementApi } from "../api/achievements";

export default function WritingGoalWidget() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    achievementApi.getGoalProgress()
      .then((data) => setProgress(data.progress))
      .catch(() => {});
  }, []);

  if (!progress) return null;

  const dailyDone = progress.dailyPercent >= 100;
  const weeklyDone = progress.weeklyPercent >= 100;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "10px",
      marginBottom: "20px",
    }}>
      {/* Daily */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {dailyDone ? "✅" : "✍️"} 今日字数
          </span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: dailyDone ? "#10b981" : "var(--text-primary)" }}>
            {progress.dailyWords} / {progress.dailyWordGoal}
          </span>
        </div>
        <div style={{
          height: "5px", borderRadius: "3px",
          background: "var(--surface-2)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            background: dailyDone ? "#10b981" : "var(--accent)",
            width: `${progress.dailyPercent}%`,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>

      {/* Weekly */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "14px 16px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {weeklyDone ? "✅" : "📅"} 本周篇数
          </span>
          <span style={{ fontSize: "12px", fontWeight: "600", color: weeklyDone ? "#10b981" : "var(--text-primary)" }}>
            {progress.weeklyEntries} / {progress.weeklyEntryGoal}
          </span>
        </div>
        <div style={{
          height: "5px", borderRadius: "3px",
          background: "var(--surface-2)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%", borderRadius: "3px",
            background: weeklyDone ? "#10b981" : "#f59e0b",
            width: `${progress.weeklyPercent}%`,
            transition: "width 0.5s ease",
          }} />
        </div>
      </div>
    </div>
  );
}
