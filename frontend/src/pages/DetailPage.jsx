import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { entriesApi } from "../api/entries";
import { useEntryStore } from "../store/entryStore";
import Modal from "../components/Modal";
import { ArrowLeftIcon, EditIcon, TrashIcon, PinIcon, LoaderIcon } from "../components/icons";

const MOOD_MAP = {
  happy:    { label: "开心",   color: "#f59e0b" },
  calm:     { label: "平静",   color: "#6366f1" },
  sad:      { label: "难过",   color: "#60a5fa" },
  angry:    { label: "愤怒",   color: "#ef4444" },
  anxious:  { label: "焦虑",   color: "#8b5cf6" },
  excited:  { label: "兴奋",   color: "#10b981" },
  grateful: { label: "感恩",   color: "#f97316" },
  tired:    { label: "疲惫",   color: "#94a3b8" },
};

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeEntry, updateEntry } = useEntryStore();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await entriesApi.get(id);
        setEntry(data.entry);
      } catch {
        setError("日记不存在或无权访问");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await entriesApi.remove(id);
      removeEntry(id);
      navigate("/");
    } catch {
      setDeleting(false);
      setDeleteModal(false);
      setError("删除失败");
    }
  };

  const handleTogglePin = async () => {
    try {
      const data = await entriesApi.togglePin(id);
      setEntry(data.entry);
      updateEntry(data.entry);
    } catch {}
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <LoaderIcon size={24} color="var(--accent)" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
        <p>{error}</p>
        <button onClick={() => navigate("/")} style={{ marginTop: "16px", color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>
          返回首页
        </button>
      </div>
    );
  }

  const mood = entry.mood ? MOOD_MAP[entry.mood] : null;

  return (
    <div className="fade-in" style={{ maxWidth: "720px" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "7px 12px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
          }}
        >
          <ArrowLeftIcon size={14} /> 返回
        </button>
        <div style={{ flex: 1 }} />

        <button
          onClick={handleTogglePin}
          title={entry.isPinned ? "取消置顶" : "置顶"}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "7px 12px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "transparent",
            color: entry.isPinned ? "var(--accent)" : "var(--text-secondary)",
            fontSize: "13px", cursor: "pointer",
          }}
        >
          <PinIcon size={14} />
          {entry.isPinned ? "已置顶" : "置顶"}
        </button>

        <button
          onClick={() => navigate(`/edit/${id}`)}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "7px 12px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
          }}
        >
          <EditIcon size={14} /> 编辑
        </button>

        <button
          onClick={() => setDeleteModal(true)}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            padding: "7px 12px", borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border)", background: "transparent",
            color: "var(--danger)", fontSize: "13px", cursor: "pointer",
          }}
        >
          <TrashIcon size={14} /> 删除
        </button>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: "700",
        color: "var(--text-primary)", lineHeight: "1.3", marginBottom: "12px",
      }}>
        {entry.title}
      </h1>

      {/* Meta */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>
          {format(new Date(entry.date), "yyyy年M月d日 EEEE", { locale: zhCN })}
        </span>
        {mood && (
          <span style={{
            fontSize: "12px", padding: "2px 10px", borderRadius: "99px",
            background: `${mood.color}18`, color: mood.color,
            fontWeight: "600", border: `1px solid ${mood.color}30`,
          }}>
            {mood.label}
          </span>
        )}
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {entry.wordCount} 字
        </span>
      </div>

      {/* Tags */}
      {entry.tags?.length > 0 && (
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "28px" }}>
          {entry.tags.map((tag) => (
            <span key={tag.id} style={{
              fontSize: "12px", padding: "3px 10px", borderRadius: "99px",
              background: "var(--accent-subtle)", color: "var(--accent-text)", fontWeight: "500",
            }}>
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: "1px", background: "var(--border)", marginBottom: "28px" }} />

      {/* Content */}
      <div
        className="diary-content"
        dangerouslySetInnerHTML={{ __html: entry.content }}
        style={{
          fontFamily: "var(--font-serif)", fontSize: "16.5px",
          lineHeight: "1.95", color: "var(--text-primary)",
        }}
      />

      {/* Delete Modal */}
      <Modal open={deleteModal} onClose={() => setDeleteModal(false)} title="删除日记">
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
          确定要删除《{entry.title}》吗？此操作无法撤销。
        </p>
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={() => setDeleteModal(false)}
            style={{
              padding: "8px 16px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
            }}
          >取消</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 20px", borderRadius: "var(--radius-md)", border: "none",
              background: "var(--danger)", color: "white",
              fontSize: "13px", fontWeight: "600", cursor: "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting && <LoaderIcon size={13} color="white" />}
            {deleting ? "删除中…" : "确认删除"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
