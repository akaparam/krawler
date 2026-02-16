import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatsCardProps = {
  title: string;
  value: string | number;
  deltaText?: string;
  trend?: "up" | "down" | "neutral";
};

export function StatsCard({ title, value, deltaText, trend = "neutral" }: StatsCardProps): JSX.Element {
  return (
    <Card className="transition hover:-translate-y-0.5 hover:shadow-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-ink-500 dark:text-ink-400">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        <p className="text-2xl font-semibold text-ink-900 dark:text-ink-100">{value}</p>
        {deltaText ? (
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              trend === "up" && "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
              trend === "down" && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
              trend === "neutral" && "bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"
            )}
          >
            {trend === "up" && <ArrowUp className="h-3 w-3" />}
            {trend === "down" && <ArrowDown className="h-3 w-3" />}
            {deltaText}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
