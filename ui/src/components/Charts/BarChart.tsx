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
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsBar data={data} margin={{ top: 16, right: 16, left: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce4eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#627d95" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#627d95" }} />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              borderColor: "#dce4eb",
              boxShadow: "0 10px 24px -14px rgba(20,40,60,0.4)"
            }}
          />
          <Bar dataKey="count" fill="#f5bc42" radius={[8, 8, 0, 0]} />
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  );
}
