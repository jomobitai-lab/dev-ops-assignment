import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// Area chart with a glowing line + gradient fill + markers.
export default function GlowArea({
  data = [], dataKey = "value", color = "#c6ff2e", height = 220, domain = ["auto", "auto"],
}) {
  const gid = `glow-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -4, bottom: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <filter id={`${gid}-f`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <CartesianGrid stroke="#1e1e1e" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#6b6b6b", fontSize: 10 }} tickLine={false} axisLine={false} minTickGap={24} />
        <YAxis tick={{ fill: "#6b6b6b", fontSize: 10 }} tickLine={false} axisLine={false}
          domain={domain} width={34} allowDecimals={false} tickFormatter={(v) => Math.round(v)} />
        <Tooltip
          contentStyle={{ background: "#121212", border: "1px solid #2a2a2a", borderRadius: 10, fontSize: 12 }}
          labelStyle={{ color: "#8b8b8b" }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gid})`}
          filter={`url(#${gid}-f)`}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 4, fill: color }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
