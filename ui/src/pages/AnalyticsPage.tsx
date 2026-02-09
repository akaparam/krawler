import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Flame, LineChart as LineChartIcon, Trophy } from "lucide-react";
import { getLinkMetadata, getLinkStatsDaily, getLinkStatsSummary } from "@/lib/api";
import { LineChart } from "@/components/Charts/LineChart";
import { BarChart } from "@/components/Charts/BarChart";
import { StatsCard } from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useLinkInsights } from "@/hooks/use-link-insights";

export default function AnalyticsPage(): JSX.Element {
  const { shortCode = "" } = useParams();

  const metadataQuery = useQuery({
    queryKey: ["link", shortCode],
    queryFn: () => getLinkMetadata(shortCode),
    enabled: Boolean(shortCode)
  });

  const summaryQuery = useQuery({
    queryKey: ["stats", shortCode],
    queryFn: () => getLinkStatsSummary(shortCode),
    enabled: Boolean(shortCode)
  });

  const dailyQuery = useQuery({
    queryKey: ["daily", shortCode],
    queryFn: () => getLinkStatsDaily(shortCode),
    enabled: Boolean(shortCode)
  });

  const daily = dailyQuery.data ?? [];
  const insights = useLinkInsights(daily);

  const topText = useMemo(() => {
    if (!daily.length) {
      return "No data points yet";
    }

    const best = daily.reduce((current, row) => (row.count > current.count ? row : current), daily[0]);
    return `${best.date} with ${best.count} clicks`;
  }, [daily]);

  if (metadataQuery.isLoading || summaryQuery.isLoading || dailyQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to={`/links/${shortCode}`}>
          <ArrowLeft className="h-4 w-4" />
          Back to link details
        </Link>
      </Button>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Clicks" value={insights.totalClicks || summaryQuery.data?.clickCount || 0} trend="up" />
        <StatsCard title="Avg Clicks / Day" value={insights.avgPerDay.toFixed(1)} deltaText="Rolling average" />
        <StatsCard title="Last Accessed" value={formatDateTime(summaryQuery.data?.lastAccessedAt)} />
        <StatsCard title="Tracked Days" value={daily.length} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-sky-600" />
              Growth Trend
            </CardTitle>
          </CardHeader>
          <CardContent>{daily.length ? <LineChart data={daily} /> : <div className="muted-text">No trend yet</div>}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              Daily Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>{daily.length ? <BarChart data={daily} /> : <div className="muted-text">No distribution yet</div>}</CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Moment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold text-ink-800">{topText}</p>
            <p className="muted-text mt-1">Derived from the available daily click breakdown.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Signal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold text-ink-800">{insights.growthText}</p>
            <p className="muted-text mt-1">Quick indicator for campaign momentum.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="inline-flex items-center gap-2">
              <Trophy className="h-4 w-4 text-sky-600" />
              Click Spike
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base font-semibold text-ink-800">{insights.spikeText}</p>
            <p className="muted-text mt-1">Highlights the strongest observed day.</p>
          </CardContent>
        </Card>
      </section>

      {metadataQuery.data ? (
        <p className="muted-text">Analyzing link <span className="font-mono">/{metadataQuery.data.shortCode}</span></p>
      ) : null}
    </div>
  );
}
