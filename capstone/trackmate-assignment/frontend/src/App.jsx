import { useState } from "react";
import { Home as HomeIcon, Dumbbell, UtensilsCrossed, TrendingUp, LayoutGrid } from "lucide-react";
import { getToken, clearToken } from "./api";
import Login from "./screens/Login.jsx";
import Home from "./screens/Home.jsx";
import Train from "./screens/Train.jsx";
import NutritionScreen from "./screens/NutritionScreen.jsx";
import ProgressScreen from "./screens/ProgressScreen.jsx";
import MoreScreen from "./screens/MoreScreen.jsx";

const TABS = [
  ["home", "Home", HomeIcon, Home],
  ["train", "Train", Dumbbell, Train],
  ["nutrition", "Food", UtensilsCrossed, NutritionScreen],
  ["progress", "Progress", TrendingUp, ProgressScreen],
  ["more", "More", LayoutGrid, MoreScreen],
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken());
  const [tab, setTab] = useState("home");

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const Current = TABS.find((t) => t[0] === tab)[3];

  return (
    <div className="mx-auto min-h-screen max-w-screen-sm">
      <main className="px-4 pb-28 pt-5">
        <Current onLogout={() => { clearToken(); setLoggedIn(false); }} />
      </main>

      {/* bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex w-full max-w-screen-sm items-center justify-around rounded-3xl border border-border bg-card/90 px-2 py-2 backdrop-blur-xl">
          {TABS.map(([key, label, Icon]) => {
            const active = tab === key;
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 transition-colors active:scale-95"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    active ? "bg-lime/15" : "bg-transparent"
                  }`}
                >
                  <Icon
                    className="h-[22px] w-[22px]"
                    strokeWidth={active ? 2.4 : 2}
                    color={active ? "#c6ff2e" : "#8a8a8a"}
                  />
                </span>
                <span className={`text-[10px] font-medium ${active ? "text-lime" : "text-muted-foreground"}`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
