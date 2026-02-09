import { useMemo } from "react";
import type { DailyStat } from "@/types/api";

export function useLinkInsights(data: DailyStat[]): {
  totalClicks: number;
  avgPerDay: number;
  growthText: string;
  spikeText: string;
} {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        totalClicks: 0,
        avgPerDay: 0,
        growthText: "No trend yet",
        spikeText: "No click spikes yet"
      };
    }

    const totalClicks = data.reduce((sum, row) => sum + row.count, 0);
    const avgPerDay = totalClicks / data.length;

    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted[sorted.length - 1]?.count ?? 0;
    const previous = sorted[sorted.length - 2]?.count ?? 0;
    const diff = last - previous;

    const growthText =
      diff > 0
        ? `+${diff} vs previous day`
        : diff < 0
          ? `${diff} vs previous day`
          : "Flat compared to previous day";

    const spike = sorted.reduce((best, row) => (row.count > best.count ? row : best), sorted[0]);
    const spikeText = `${spike.count} clicks on ${spike.date}`;

    return {
      totalClicks,
      avgPerDay,
      growthText,
      spikeText
    };
  }, [data]);
}
