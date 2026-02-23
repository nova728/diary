import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { entriesApi } from "../api/entries";
import { useEntryStore } from "../store/entryStore";
import RichEditor from "../components/Editor";
import { ArrowLeftIcon, LoaderIcon, XIcon } from "../components/icons";

const MOODS = [
  { id: "happy",    label: "开心",  color: "#f59e0b" },
  { id: "calm",     label: "平静",  color: "#6366f1" },
  { id: "sad",      label: "难过",  color: "#60a5fa" },
  { id: "angry",    label: "愤怒",  color: "#ef4444" },
  { id: "anxious",  label: "焦虑",  color: "#8b5cf6" },
  { id: "excited",  label: "兴奋",  color: "#10b981" },
  { id: "grateful", label: "感恩",  color: "#f97316" },
  { id: "tired",    label: "疲惫",  color: "#94a3b8" },
];

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addEntry, updateEntry } = useEntryStore();

  const [form, setForm] = useState({
    title: "",
    content: "",
    contentText: "",
    mood: "",
    date: new Date().toISOString().slice(0, 10),
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(!!id);
  const [error, setError] = useState("");

  // If editing, fetch the existing entry
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await entriesApi.get(id);
        const e = data.entry;
        setForm({
          title: e.title,
          content: e.content,
          contentText: e.contentText || "",
          mood: e.mood || "",
          date: e.date,
          tags: e.tags?.map((t) => t.name) || [],
        });
      } catch {
        setError("无法加载日记");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [id]);

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const addTag = (e) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/^#/, "");
      if (t && !form.tags.includes(t)) {
        set("tags")([...form.tags, t]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tag) => set("tags")(form.tags.filter((t) => t !== tag));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError("请填写标题"); return; }
    if (!form.content || form.content === "<p></p>") { setError("请填写内容"); return; }

    setError("");
    setLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content,
        mood: form.mood || null,
        date: form.date,
        tags: form.tags,
      };

      if (id) {
        const data = await entriesApi.update(id, payload);
        updateEntry(data.entry);
      } else {
        const data = await entriesApi.create(payload);
        addEntry(data.entry);
      }

      navigate(id ? `/entry/${id}` : "/");
    } catch (err) {
      setError(err.response?.data?.error || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <LoaderIcon size={24} color="var(--accent)" />
      </div>
    );
  }

  return (
    <div className="fade-in editor-shell">
      {/* Top bar */}
      <div className="editor-topbar">
        <button className="btn-secondary" onClick={() => navigate(-1)}>
          <ArrowLeftIcon size={14} /> 返回
        </button>

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            取消
          </button>
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading && <LoaderIcon size={13} color="white" />}
            {loading ? "保存中…" : "保存"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "10px 14px", borderRadius: "var(--radius-md)",
          background: "var(--danger-subtle)", color: "var(--danger)",
          fontSize: "13px", marginBottom: "20px",
        }}>{error}</div>
      )}

      {/* Title */}
      <input
        value={form.title}
        onChange={(e) => set("title")(e.target.value)}
        placeholder="今天想记录什么…"
        style={{
          width: "100%", fontSize: "28px", fontWeight: "800",
          fontFamily: "var(--font-serif)", border: "none",
          background: "transparent", color: "var(--text-primary)",
          outline: "none", marginBottom: "16px",
        }}
      />

      {/* Date + Mood row */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap" }}>
        <div>
          <label style={labelStyle}>日期</label>
          <input
            type="date"
            value={form.date}
            onChange={(e) => set("date")(e.target.value)}
            style={{
              padding: "7px 10px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)", background: "var(--surface-2)",
              color: "var(--text-primary)", fontSize: "13px", outline: "none",
            }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <label style={labelStyle}>今天的心情</label>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => set("mood")(form.mood === m.id ? "" : m.id)}
                className={`pill-option ${form.mood === m.id ? "is-active" : ""}`}
                style={{ borderColor: form.mood === m.id ? m.color : undefined, color: form.mood === m.id ? m.color : undefined, background: form.mood === m.id ? `${m.color}18` : undefined }}
              >{m.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Rich Editor */}
      <div style={{ marginBottom: "20px" }}>
        <RichEditor
          content={form.content}
          onChange={(html) => set("content")(html)}
        />
      </div>

      {/* Tags */}
      <div>
        <label style={labelStyle}>标签</label>
        <div style={{
          display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center",
          padding: "10px 12px", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)", background: "var(--surface)",
          minHeight: "46px",
        }}>
          {form.tags.map((tag) => (
            <span key={tag} className="tag-chip">
              #{tag}
              <span
                onClick={() => removeTag(tag)}
                style={{ cursor: "pointer", display: "flex", opacity: 0.6 }}
              >
                <XIcon size={11} />
              </span>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder={form.tags.length === 0 ? "添加标签，按 Enter 确认…" : ""}
            style={{
              flex: 1, minWidth: "120px", border: "none",
              background: "transparent", color: "var(--text-primary)",
              fontSize: "13px", outline: "none",
            }}
          />
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: "block", fontSize: "12px", fontWeight: "500",
  color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.04em",
};
