import { useState } from "react";
import { getToken, clearToken } from "./api";
import Login from "./components/Login.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Workouts from "./components/Workouts.jsx";
import BodyWeight from "./components/BodyWeight.jsx";
import Nutrition from "./components/Nutrition.jsx";
import Earnings from "./components/Earnings.jsx";
import Sleep from "./components/Sleep.jsx";
import Achievements from "./components/Achievements.jsx";
import Goals from "./components/Goals.jsx";

const NAV = [
  ["dashboard", "📊", "Dashboard", Dashboard],
  ["workouts", "🏋️", "Workouts", Workouts],
  ["weight", "⚖️", "Body Weight", BodyWeight],
  ["nutrition", "🍽️", "Nutrition", Nutrition],
  ["sleep", "😴", "Sleep", Sleep],
  ["earnings", "💰", "Earnings", Earnings],
  ["achievements", "🏆", "Achievements", Achievements],
  ["goals", "🎯", "Goals", Goals],
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [active, setActive] = useState("dashboard");

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const Current = NAV.find((n) => n[0] === active)[3];
  const title = NAV.find((n) => n[0] === active)[2];

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">Track<span>Mate</span></div>
        {NAV.map(([key, icon, label]) => (
          <div
            key={key}
            className={`nav-item ${active === key ? "active" : ""}`}
            onClick={() => setActive(key)}
          >
            <span>{icon}</span>
            <span className="nav-label">{label}</span>
          </div>
        ))}
        <div className="logout" onClick={() => { clearToken(); setLoggedIn(false); }}>
          ⎋ Log out
        </div>
      </aside>
      <main className="content">
        <div className="page-title">{title}</div>
        <Current />
      </main>
    </div>
  );
}
