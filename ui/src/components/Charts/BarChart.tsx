import {
  Bar,
  BarChart as RechartsBar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DailyStat } from "@/types/api";

type BarChartProps = {
  data: DailyStat[];
};

export function BarChart({ data }: BarChartProps): JSX.Element {
  const isDark = document.documentElement.classList.contains("dark");

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsBar data={data} margin={{ top: 16, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#4b5563" : "#dce4eb"} />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: isDark ? "#d1d5db" : "#627d95" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: isDark ? "#d1d5db" : "#627d95" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              borderColor: isDark ? "#4b5563" : "#dce4eb",
              backgroundColor: isDark ? "#1f2937" : "#ffffff",
              color: isDark ? "#f3f4f6" : "#213544",
              boxShadow: "0 10px 24px -14px rgba(20,40,60,0.4)"
            }}
          />
          <Bar dataKey="count" fill="#f5bc42" radius={[8, 8, 0, 0]} />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
