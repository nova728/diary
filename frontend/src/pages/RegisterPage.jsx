import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { BookIcon, LoaderIcon } from "../components/icons";

export default function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("密码至少需要 8 位");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.register(form);
      setAuth(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const inputStyle = {
    width: "100%", padding: "10px 13px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border)",
    background: "var(--surface-2)",
    color: "var(--text-primary)",
    fontSize: "14px", outline: "none",
    transition: "border-color 0.15s",
  };
  const labelStyle = {
    display: "block", fontSize: "13px", fontWeight: "500",
    color: "var(--text-secondary)", marginBottom: "6px",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: "20px",
    }}>
      <div style={{
        width: "100%", maxWidth: "400px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-xl)",
        padding: "40px",
        boxShadow: "var(--shadow-lg)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "48px", height: "48px",
            background: "var(--accent)", borderRadius: "14px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
          }}>
            <BookIcon size={22} color="white" strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "22px", fontWeight: "700", color: "var(--text-primary)" }}>
            创建账号
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>
            开始记录你的每一天
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { key: "username", label: "昵称", type: "text", placeholder: "你的名字" },
            { key: "email", label: "邮箱", type: "email", placeholder: "your@email.com" },
            { key: "password", label: "密码", type: "password", placeholder: "至少 8 位" },
          ].map(({ key, label, type, placeholder }) => (
            <div key={key} style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={set(key)}
                placeholder={placeholder}
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
          ))}

          {error && (
            <div style={{
              padding: "10px 14px", borderRadius: "8px",
              background: "var(--danger-subtle)", color: "var(--danger)",
              fontSize: "13px", marginBottom: "16px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "11px",
              borderRadius: "var(--radius-md)", border: "none",
              background: "var(--accent)", color: "white",
              fontSize: "14px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              opacity: loading ? 0.7 : 1,
              marginTop: "8px",
            }}
          >
            {loading && <LoaderIcon size={15} color="white" />}
            {loading ? "注册中…" : "注册"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "13px", color: "var(--text-muted)" }}>
          已有账号？{" "}
          <Link to="/login" style={{ color: "var(--accent)", fontWeight: "600" }}>
            立即登录
          </Link>
        </p>
      </div>
    </div>
  );
}
