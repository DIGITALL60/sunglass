import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!localStorage.getItem("admin_token"));
  }, []);

  const handleLogin = (token: string) => {
    localStorage.setItem("admin_token", token);
    setAuthed(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setAuthed(false);
  };

  return authed
    ? <DashboardPage onLogout={handleLogout} />
    : <LoginPage onLogin={handleLogin} />;
}
