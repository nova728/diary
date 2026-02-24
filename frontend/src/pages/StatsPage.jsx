import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid,
} from "recharts";
import { statsApi } from "../api/stats";
import { LoaderIcon } from "../components/icons";

const MOOD_COLORS = {
  happy: "#f59e0b", calm: "#6366f1", sad: "#60a5fa",
  angry: "#ef4444", anxious: "#8b5cf6", excited: "#10b981",
  grateful: "#f97316", tired: "#94a3b8",
};
const MOOD_LABELS = {
  happy: "开心", calm: "平静", sad: "难过", angry: "愤怒",
  anxious: "焦虑", excited: "兴奋", grateful: "感恩", tired: "疲惫",
};

function StatCard({ label, value, sub }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)", padding: "20px",
    }}>
      <div style={{ fontSize: "30px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--font-serif)", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>{label}</div>
      {sub && <div style={{ fontSize: "11px", color: "var(--accent)", marginTop: "2px" }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: "14px", fontWeight: "600",
      color: "var(--text-secondary)", marginBottom: "14px",
      letterSpacing: "0.04em",
    }}>{children}</h2>
  );
}

export default function StatsPage() {
  const [overview, setOverview] = useState(null);
  const [moods, setMoods] = useState([]);
  const [activity, setActivity] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    (async () => {
      try {
        const [ov, md, ac, tg] = await Promise.all([
          statsApi.overview(),
          statsApi.moods(),
          statsApi.activity({ year }),
          statsApi.tags(),
        ]);
        setOverview(ov);
        setMoods(md.moods.map((m) => ({ ...m, name: MOOD_LABELS[m.mood] || m.mood, color: MOOD_COLORS[m.mood] || "#888" })));
        setActivity(ac.activity.map((a) => ({ ...a, date: a.date?.slice(5) })));
        setTags(tg.tags.slice(0, 10));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <LoaderIcon size={24} color="var(--accent)" />
      </div>
    );
  }

  const tooltipStyle = {
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "8px", fontSize: "13px", boxShadow: "var(--shadow-md)",
  };

  return (
    <div className="fade-in">
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "24px" }}>
        写作统计
      </h1>

      {/* Overview cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px", marginBottom: "32px" }}>
        <StatCard label="总篇数" value={overview?.totalEntries ?? 0} />
        <StatCard label="总字数" value={(overview?.totalWords ?? 0).toLocaleString()} />
        <StatCard label="连续打卡" value={`${overview?.streak ?? 0}天`} sub="保持下去！" />
        <StatCard label="本月篇数" value={overview?.thisMonth ?? 0} />
      </div>

      {/* Activity chart */}
      {activity.length > 0 && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px", marginBottom: "20px" }}>
          <SectionTitle>{year}年 写作频率</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={activity} barSize={4} margin={{ left: 16, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} width={36} />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={{ color: "var(--text-secondary)" }}
                itemStyle={{ color: "var(--accent)" }}
                formatter={(val) => [val, "篇"]}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
        {/* Mood pie */}
        {moods.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
            <SectionTitle>心情分布</SectionTitle>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={moods} dataKey="count" nameKey="name"
                  cx="50%" cy="50%" outerRadius={70} innerRadius={36}
                >
                  {moods.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val, name) => [val + " 篇", name]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
              {moods.map((m) => (
                <span key={m.mood} style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "var(--text-secondary)" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: m.color, display: "inline-block" }} />
                  {m.name} {m.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top tags */}
        {tags.length > 0 && (
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
            <SectionTitle>常用标签 Top 10</SectionTitle>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={tags} layout="vertical" barSize={10}>
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} tickLine={false} axisLine={false} width={52} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val) => [val, "次"]}
                />
                <Bar dataKey="count" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
