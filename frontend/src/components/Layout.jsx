import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const styles = {
  root: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "var(--bg)",
  },
  main: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    flex: 1,
    padding: "36px 40px",
    maxWidth: "900px",
    width: "100%",
    margin: "0 auto",
  },
};

export default function Layout() {
  return (
    <div style={styles.root}>
      <Sidebar />
      <main style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
