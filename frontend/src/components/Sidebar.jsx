import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../hooks/useTheme";
import {
  HomeIcon, CalendarIcon, BarChartIcon, TagIcon,
  MoonIcon, SunIcon, LogOutIcon, BookIcon,
  TrophyIcon, TimelineIcon,
} from "./icons";

const NAV_ITEMS = [
  { to: "/", icon: HomeIcon, label: "首页", end: true },
  { to: "/calendar", icon: CalendarIcon, label: "日历" },
  { to: "/timeline", icon: TimelineIcon, label: "时间线" },
  { to: "/stats", icon: BarChartIcon, label: "统计" },
  { to: "/achievements", icon: TrophyIcon, label: "成就" },
];

const s = {
  sidebar: {
    width: "var(--sidebar-width)",
    flexShrink: 0,
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  logo: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid var(--border)",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    width: "32px", height: "32px",
    background: "var(--accent)",
    borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  logoText: {
    fontSize: "17px",
    fontWeight: "700",
    fontFamily: "var(--font-serif)",
    color: "var(--text-primary)",
    letterSpacing: "0.02em",
  },
  nav: { flex: 1, padding: "12px 10px" },
  bottom: {
    padding: "12px 10px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
};

function NavItem({ to, icon: Icon, label, end }) {
  return (
    <NavLink to={to} end={end} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "9px 12px", borderRadius: "8px",
          background: isActive ? "var(--accent-subtle)" : "transparent",
          color: isActive ? "var(--accent)" : "var(--text-secondary)",
          fontSize: "14px", fontWeight: isActive ? "600" : "400",
          marginBottom: "2px", cursor: "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
          onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-2)"; }}
          onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
        >
          <Icon size={17} color={isActive ? "var(--accent)" : "var(--text-secondary)"} />
          {label}
        </div>
      )}
    </NavLink>
  );
}

function ActionButton({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "8px", border: "none",
        background: "transparent", color: "var(--text-secondary)",
        fontSize: "14px", cursor: "pointer", textAlign: "left",
        transition: "background 0.15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-2)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={s.sidebar}>
      {/* Logo */}
      <div style={s.logo}>
        <div style={s.logoIcon}>
          <BookIcon size={16} color="white" strokeWidth={2} />
        </div>
        <span style={s.logoText}>心迹</span>
      </div>

      {/* Navigation */}
      <nav style={s.nav}>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* User info */}
      <div style={{
        margin: "0 10px 8px",
        padding: "12px",
        borderRadius: "10px",
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent), #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: "700", color: "white", flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username}
            </div>
            <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div style={s.bottom}>
        <ActionButton
          icon={theme === "light" ? MoonIcon : SunIcon}
          label={theme === "light" ? "深色模式" : "浅色模式"}
          onClick={toggle}
        />
        <ActionButton icon={LogOutIcon} label="退出登录" onClick={handleLogout} />
      </div>
    </aside>
  );
}
