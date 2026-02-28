import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoriesApi } from "../api/memories";
import { SparklesIcon, RefreshIcon } from "./icons";

const MOOD_EMOJIS = {
  happy: "😊", calm: "😌", sad: "😢", angry: "😤",
  anxious: "😰", excited: "🤩", grateful: "🙏", tired: "😴",
};

const toPlainText = (html) =>
  html ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";

function MemoryCard({ entry, label, sublabel, onRefresh }) {
  const navigate = useNavigate();
  const preview = toPlainText(entry.content).slice(0, 80);

  return (
    <div
      onClick={() => navigate(`/entry/${entry.id}`)}
      style={{
        background: "linear-gradient(135deg, var(--surface) 0%, var(--accent-subtle) 100%)",
        border: "1px solid var(--accent)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 18px",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <SparklesIcon size={14} color="var(--accent)" />
          <span style={{ fontSize: "11px", fontWeight: "600", color: "var(--accent)", letterSpacing: "0.05em" }}>
            {label}
          </span>
        </div>
        {sublabel && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            {sublabel}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRefresh();
            }}
            style={{
              border: "none", background: "transparent", cursor: "pointer",
              color: "var(--text-muted)", padding: "2px",
              display: "flex", alignItems: "center",
            }}
            title="换一篇"
          >
            <RefreshIcon size={13} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        {entry.mood && (
          <span style={{ fontSize: "20px", flexShrink: 0, marginTop: "1px" }}>
            {MOOD_EMOJIS[entry.mood] || ""}
          </span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4 style={{
            fontSize: "14px", fontWeight: "600", color: "var(--text-primary)",
            fontFamily: "var(--font-serif)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            marginBottom: "4px",
          }}>
            {entry.title}
          </h4>
          {preview && (
            <p style={{
              fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.5,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {preview}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MemoryCards() {
  const [onThisDayEntries, setOnThisDayEntries] = useState([]);
  const [randomEntry, setRandomEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMemories = async () => {
    try {
      const [otd, rand] = await Promise.all([
        memoriesApi.onThisDay(),
        memoriesApi.random(),
      ]);
      setOnThisDayEntries(otd.entries || []);
      setRandomEntry(rand.entry || null);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const refreshRandom = async () => {
    try {
      const data = await memoriesApi.random();
      setRandomEntry(data.entry || null);
    } catch {
      // Silently fail
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  if (loading) return null;

  // Don't show if nothing to display
  if (onThisDayEntries.length === 0 && !randomEntry) return null;

  return (
    <div style={{ marginBottom: "24px" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: onThisDayEntries.length > 0 && randomEntry ? "1fr 1fr" : "1fr",
        gap: "12px",
      }}>
        {/* On this day */}
        {onThisDayEntries.length > 0 && (
          <MemoryCard
            entry={onThisDayEntries[0]}
            label="那年今日"
            sublabel={`${onThisDayEntries[0].yearsAgo} 年前`}
          />
        )}

        {/* Random memory */}
        {randomEntry && (
          <MemoryCard
            entry={randomEntry}
            label="随机回顾"
            sublabel={randomEntry.date}
            onRefresh={refreshRandom}
          />
        )}
      </div>

      {/* More "on this day" entries if any */}
      {onThisDayEntries.length > 1 && (
        <div style={{ marginTop: "8px" }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
            更多「那年今日」：
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {onThisDayEntries.slice(1).map((entry) => (
              <MemoryCard
                key={entry.id}
                entry={entry}
                label={`${entry.yearsAgo} 年前`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
