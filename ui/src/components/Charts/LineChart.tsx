import {
  CartesianGrid,
  Line,
  LineChart as RechartsLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DailyStat } from "@/types/api";

type LineChartProps = {
  data: DailyStat[];
};

export function LineChart({ data }: LineChartProps): JSX.Element {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <RechartsLine data={data} margin={{ top: 16, right: 16, left: 4, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey="count"
            stroke="#09bee8"
            strokeWidth={3}
            dot={{ stroke: "#09bee8", strokeWidth: 2, r: 3, fill: "#ffffff" }}
          />
        </RechartsLine>
      </ResponsiveContainer>
    </div>
  );
}
