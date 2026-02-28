import { useEffect, useState } from "react";

export default function AchievementToast({ achievements = [], onClose }) {
  const [visible, setVisible] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (achievements.length === 0) return;
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        setVisible(false);
        setTimeout(() => onClose?.(), 300);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length]);

  if (!visible || achievements.length === 0) return null;

  const ach = achievements[currentIndex];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 9999,
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div style={{
        background: "var(--surface)",
        border: "2px solid var(--accent)",
        borderRadius: "var(--radius-lg)",
        padding: "16px 20px",
        boxShadow: "var(--shadow-lg)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "280px",
      }}>
        <div style={{ fontSize: "32px" }}>{ach.icon}</div>
        <div>
          <div style={{
            fontSize: "10px", fontWeight: "700", color: "var(--accent)",
            letterSpacing: "0.1em", marginBottom: "2px",
          }}>
            🎉 成就解锁！
          </div>
          <div style={{
            fontSize: "15px", fontWeight: "700", color: "var(--text-primary)",
            fontFamily: "var(--font-serif)",
          }}>
            {ach.name}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {ach.description}
          </div>
        </div>
        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          style={{
            border: "none", background: "transparent",
            color: "var(--text-muted)", cursor: "pointer",
            fontSize: "16px", padding: "4px", lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
