import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkle } from "lucide-react";
import { CreateLinkForm } from "@/components/CreateLinkForm";
import { LinkCard } from "@/components/LinkCard";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useActivityFeed } from "@/hooks/use-activity-feed";
import { formatDateTime } from "@/lib/utils";
import { getKpiMetrics, useLinksStore } from "@/store/links-store";
import { useUiStore } from "@/store/ui-store";

export default function DashboardPage(): JSX.Element {
  const knownLinks = useLinksStore((state) => state.knownLinks);
  const openEditDialog = useUiStore((state) => state.openEditDialog);

  const recentLinks = useMemo(() => knownLinks.slice(0, 6), [knownLinks]);
  const kpis = useMemo(() => getKpiMetrics(knownLinks), [knownLinks]);
  const activity = useActivityFeed(knownLinks);

  return (
    <div className="space-y-6">
      <CreateLinkForm />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Clicks" value={kpis.totalClicks} deltaText="Live aggregate" trend="up" />
        <StatsCard title="Active Links" value={kpis.activeLinks} deltaText="Ready to redirect" />
        <StatsCard title="Expired Links" value={kpis.expiredLinks} deltaText="Needs update" trend="down" />
        <StatsCard
          title="Protected Links"
          value={kpis.protectedLinks}
          deltaText="Password-guarded"
          trend="neutral"
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Recent Links</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/explore">
                Explore all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLinks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-6 text-center">
                <p className="text-sm font-medium text-ink-700">No links yet</p>
                <p className="muted-text mt-1">Create your first short URL above to populate this dashboard.</p>
              </div>
            ) : (
              recentLinks.map((link) => (
                <LinkCard key={link.shortCode} link={link} onEdit={openEditDialog} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkle className="h-4 w-4 text-sky-600" />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activity.length === 0 ? (
              <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-5 text-center text-sm text-ink-500">
                Activity appears as soon as links are created and clicked.
              </div>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="rounded-xl border border-ink-100 bg-white p-3">
                  <p className="text-sm font-medium text-ink-700">{item.message}</p>
                  <p className="mt-1 text-xs text-ink-400">{formatDateTime(item.timestamp)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
