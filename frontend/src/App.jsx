import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useTheme } from "./hooks/useTheme";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import EditorPage from "./pages/EditorPage";
import DetailPage from "./pages/DetailPage";
import CalendarPage from "./pages/CalendarPage";
import StatsPage from "./pages/StatsPage";
import AchievementsPage from "./pages/AchievementsPage";
import TimelinePage from "./pages/TimelinePage";

function PrivateRoute({ children }) {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token } = useAuthStore();
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  useTheme(); // applies saved theme on mount

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Private routes wrapped in Layout */}
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<HomePage />} />
          <Route path="new" element={<EditorPage />} />
          <Route path="edit/:id" element={<EditorPage />} />
          <Route path="entry/:id" element={<DetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="achievements" element={<AchievementsPage />} />
          <Route path="timeline" element={<TimelinePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
