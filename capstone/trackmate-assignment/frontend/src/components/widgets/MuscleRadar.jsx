import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
} from "recharts";

// Radar of training volume per muscle group (sets logged).
export default function MuscleRadar({ data = [] }) {
  const chart = data.map((d) => ({ group: d.group, sets: d.sets }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={chart} outerRadius="72%">
        <PolarGrid stroke="#2a2a2a" />
        <PolarAngleAxis
          dataKey="group"
          tick={{ fill: "#8b8b8b", fontSize: 11 }}
        />
        <Radar
          dataKey="sets"
          stroke="#c6ff2e"
          strokeWidth={2}
          fill="#c6ff2e"
          fillOpacity={0.35}
          isAnimationActive={false}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
