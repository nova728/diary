import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { PinIcon, TagIcon } from "./icons";

const MOOD_MAP = {
  happy:    { label: "开心",   color: "#f59e0b", bg: "#fefce8" },
  calm:     { label: "平静",   color: "#6366f1", bg: "#eef2ff" },
  sad:      { label: "难过",   color: "#60a5fa", bg: "#eff6ff" },
  angry:    { label: "愤怒",   color: "#ef4444", bg: "#fef2f2" },
  anxious:  { label: "焦虑",   color: "#8b5cf6", bg: "#f5f3ff" },
  excited:  { label: "兴奋",   color: "#10b981", bg: "#ecfdf5" },
  grateful: { label: "感恩",   color: "#f97316", bg: "#fff7ed" },
  tired:    { label: "疲惫",   color: "#94a3b8", bg: "#f8fafc" },
};

// Strip HTML for preview
const toPlainText = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

export default function EntryCard({ entry }) {
  const navigate = useNavigate();
  const mood = entry.mood ? MOOD_MAP[entry.mood] : null;
  const preview = toPlainText(entry.content).slice(0, 120);

  return (
    <article
      onClick={() => navigate(`/entry/${entry.id}`)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "20px 22px",
        cursor: "pointer",
        transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
        position: "relative",
        marginBottom: "12px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--accent)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Pin indicator */}
      {entry.isPinned && (
        <div style={{ position: "absolute", top: "14px", right: "14px", color: "var(--accent)", opacity: 0.7 }}>
          <PinIcon size={14} />
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
        <h3 style={{
          flex: 1,
          fontSize: "17px",
          fontWeight: "700",
          color: "var(--text-primary)",
          fontFamily: "var(--font-serif)",
          lineHeight: "1.35",
          paddingRight: entry.isPinned ? "20px" : "0",
        }}>
          {entry.title}
        </h3>
      </div>

      {/* Preview */}
      {preview && (
        <p style={{
          fontSize: "15px",
          color: "var(--text-secondary)",
          lineHeight: "1.6",
          marginBottom: "14px",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {preview}{preview.length >= 120 ? "…" : ""}
        </p>
      )}

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          {mood && (
            <span style={{
              fontSize: "12px",
              padding: "3px 10px",
              borderRadius: "99px",
              background: mood.bg,
              color: mood.color,
              fontWeight: "700",
              border: `1px solid ${mood.color}30`,
            }}>
              {mood.label}
            </span>
          )}
          {entry.tags?.slice(0, 3).map((tag) => (
            <span key={tag.id} style={{
              fontSize: "12px",
              padding: "3px 8px",
              borderRadius: "99px",
              background: "var(--accent-subtle)",
              color: "var(--accent-text)",
              fontWeight: "600",
            }}>
              #{tag.name}
            </span>
          ))}
          {entry.tags?.length > 3 && (
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
              +{entry.tags.length - 3}
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {entry.wordCount} 字
          </span>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {format(new Date(entry.date), "M月d日", { locale: zhCN })}
          </span>
        </div>
      </div>
    </article>
  );
}
