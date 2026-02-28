import { useEffect, useState } from "react";
import { achievementApi } from "../api/achievements";
import { LoaderIcon } from "../components/icons";

const CATEGORY_LABELS = {
  streak: "连续写作",
  entries: "日记篇数",
  words: "字数里程碑",
  special: "特殊成就",
};

const CATEGORY_ORDER = ["streak", "entries", "words", "special"];

function AchievementCard({ achievement }) {
  const { icon, name, description, unlocked, unlockedAt } = achievement;

  return (
    <div
      style={{
        background: unlocked ? "var(--surface)" : "var(--surface-2)",
        border: `1px solid ${unlocked ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "20px",
        textAlign: "center",
        opacity: unlocked ? 1 : 0.5,
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (unlocked) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "var(--shadow-md)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {unlocked && (
        <div style={{
          position: "absolute", top: "6px", right: "8px",
          fontSize: "10px", color: "var(--accent)", fontWeight: "600",
        }}>
          ✓ 已解锁
        </div>
      )}
      <div style={{ fontSize: "36px", marginBottom: "8px", filter: unlocked ? "none" : "grayscale(1)" }}>
        {icon}
      </div>
      <div style={{
        fontSize: "14px", fontWeight: "700",
        color: unlocked ? "var(--text-primary)" : "var(--text-muted)",
        marginBottom: "4px",
      }}>
        {name}
      </div>
      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
        {description}
      </div>
      {unlocked && unlockedAt && (
        <div style={{ fontSize: "10px", color: "var(--accent)", marginTop: "8px" }}>
          {new Date(unlockedAt).toLocaleDateString("zh-CN")}
        </div>
      )}
    </div>
  );
}

function GoalProgress({ progress }) {
  if (!progress) return null;

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px",
      marginBottom: "24px",
    }}>
      <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "16px", letterSpacing: "0.04em" }}>
        今日写作目标
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Daily word goal */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>今日字数</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
              {progress.dailyWords} / {progress.dailyWordGoal}
            </span>
          </div>
          <div style={{
            height: "8px", borderRadius: "4px",
            background: "var(--surface-2)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: "4px",
              background: progress.dailyPercent >= 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, var(--accent), #a78bfa)",
              width: `${progress.dailyPercent}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {progress.dailyPercent >= 100 ? "🎉 已完成！" : `还差 ${progress.dailyWordGoal - progress.dailyWords} 字`}
          </div>
        </div>

        {/* Weekly entry goal */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>本周篇数</span>
            <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>
              {progress.weeklyEntries} / {progress.weeklyEntryGoal}
            </span>
          </div>
          <div style={{
            height: "8px", borderRadius: "4px",
            background: "var(--surface-2)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", borderRadius: "4px",
              background: progress.weeklyPercent >= 100
                ? "linear-gradient(90deg, #10b981, #34d399)"
                : "linear-gradient(90deg, #f59e0b, #fbbf24)",
              width: `${progress.weeklyPercent}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
            {progress.weeklyPercent >= 100 ? "🎉 已完成！" : `还差 ${progress.weeklyEntryGoal - progress.weeklyEntries} 篇`}
          </div>
        </div>
      </div>
    </div>
  );
}

function GoalSettings({ goal, onSave }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    dailyWordGoal: goal?.dailyWordGoal || 300,
    weeklyEntryGoal: goal?.weeklyEntryGoal || 3,
    reminderEnabled: goal?.reminderEnabled || false,
    reminderTime: goal?.reminderTime || "21:00",
  });

  const handleSave = async () => {
    await onSave(form);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        style={{
          fontSize: "12px", color: "var(--accent)", background: "none",
          border: "none", cursor: "pointer", fontWeight: "500",
        }}
      >
        ⚙ 设置目标
      </button>
    );
  }

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius-lg)",
      padding: "20px",
      marginBottom: "20px",
    }}>
      <h3 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "16px" }}>
        目标设置
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          每日字数目标
          <input
            type="number"
            value={form.dailyWordGoal}
            onChange={(e) => setForm({ ...form, dailyWordGoal: parseInt(e.target.value) || 300 })}
            min={50}
            max={10000}
            step={50}
            style={{
              width: "100%", padding: "8px 10px", marginTop: "6px",
              borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text-primary)",
              fontSize: "14px", outline: "none",
            }}
          />
        </label>
        <label style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
          每周篇数目标
          <input
            type="number"
            value={form.weeklyEntryGoal}
            onChange={(e) => setForm({ ...form, weeklyEntryGoal: parseInt(e.target.value) || 3 })}
            min={1}
            max={14}
            style={{
              width: "100%", padding: "8px 10px", marginTop: "6px",
              borderRadius: "var(--radius-md)", border: "1px solid var(--border)",
              background: "var(--surface)", color: "var(--text-primary)",
              fontSize: "14px", outline: "none",
            }}
          />
        </label>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={form.reminderEnabled}
            onChange={(e) => setForm({ ...form, reminderEnabled: e.target.checked })}
          />
          每日写作提醒
        </label>
        {form.reminderEnabled && (
          <input
            type="time"
            value={form.reminderTime}
            onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
            style={{
              padding: "6px 10px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)", background: "var(--surface)",
              color: "var(--text-primary)", fontSize: "13px", outline: "none",
            }}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "8px 18px", borderRadius: "var(--radius-md)",
            border: "none", background: "var(--accent)", color: "white",
            fontSize: "13px", fontWeight: "600", cursor: "pointer",
          }}
        >
          保存
        </button>
        <button
          onClick={() => setEditing(false)}
          style={{
            padding: "8px 18px", borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)", background: "var(--surface)",
            color: "var(--text-secondary)", fontSize: "13px", cursor: "pointer",
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [progress, setProgress] = useState(null);
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [achData, progressData] = await Promise.all([
        achievementApi.list(),
        achievementApi.getGoalProgress(),
      ]);
      setAchievements(achData.achievements || []);
      setProgress(progressData.progress || null);
      setGoal(progressData.goal || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveGoal = async (form) => {
    await achievementApi.updateGoal(form);
    loadData();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "80px 0" }}>
        <LoaderIcon size={24} color="var(--accent)" />
      </div>
    );
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  // Group by category
  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: achievements.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", fontWeight: "700", color: "var(--text-primary)" }}>
            成就徽章
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "3px" }}>
            已解锁 {unlockedCount} / {achievements.length} 个成就
          </p>
        </div>
        <GoalSettings goal={goal} onSave={handleSaveGoal} />
      </div>

      {/* Writing goal progress */}
      <GoalProgress progress={progress} />

      {/* Achievement categories */}
      {grouped.map((group) => (
        <div key={group.category} style={{ marginBottom: "28px" }}>
          <h2 style={{
            fontSize: "14px", fontWeight: "600", color: "var(--text-secondary)",
            marginBottom: "14px", letterSpacing: "0.04em",
          }}>
            {group.label}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {group.items.map((ach) => (
              <AchievementCard key={ach.key} achievement={ach} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
