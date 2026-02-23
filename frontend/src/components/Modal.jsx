import { useEffect } from "react";
import { XIcon } from "./icons";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 999, padding: "20px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-lg)",
          width: "100%", maxWidth: "440px",
          animation: "fadeIn 0.15s ease",
        }}
      >
        {title && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "18px 20px 0",
          }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)" }}>{title}</h3>
            <button
              onClick={onClose}
              style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer" }}
            >
              <XIcon size={18} />
            </button>
          </div>
        )}
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}
