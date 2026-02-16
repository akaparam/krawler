import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, LockKeyhole, Trash2 } from "lucide-react";
import {
  deleteLink,
  getLinkMetadata,
  getLinkStatsDaily,
  getLinkStatsSummary,
  getPublicShortLink
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BarChart } from "@/components/Charts/BarChart";
import { LineChart } from "@/components/Charts/LineChart";
import { CopyButton } from "@/components/CopyButton";
import { StatsCard } from "@/components/StatsCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateTime, getStatusLabel } from "@/lib/utils";
import { useLinkInsights } from "@/hooks/use-link-insights";
import { useLinksStore } from "@/store/links-store";
import { useUiStore } from "@/store/ui-store";

export default function LinkDetailsPage(): JSX.Element {
  const { shortCode = "" } = useParams();
  const openEditDialog = useUiStore((state) => state.openEditDialog);
  const removeLink = useLinksStore((state) => state.removeLink);
  const upsertKnownLink = useLinksStore((state) => state.upsertKnownLink);
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [redirectPassword, setRedirectPassword] = useState("");

  const metadataQuery = useQuery({
    queryKey: ["link", shortCode],
    queryFn: () => getLinkMetadata(shortCode),
    enabled: Boolean(shortCode),
    refetchInterval: 60_000
  });

  const summaryQuery = useQuery({
    queryKey: ["stats", shortCode],
    queryFn: () => getLinkStatsSummary(shortCode),
    enabled: Boolean(shortCode),
    refetchInterval: 45_000
  });

  const dailyQuery = useQuery({
    queryKey: ["daily", shortCode],
    queryFn: () => getLinkStatsDaily(shortCode),
    enabled: Boolean(shortCode),
    refetchInterval: 45_000
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteLink(shortCode),
    onSuccess: () => {
      removeLink(shortCode);
      toast.success("Link deleted", `/${shortCode} removed`);
      navigate("/");
    },
    onError: (error) => {
      toast.error("Delete failed", error instanceof Error ? error.message : undefined);
    }
  });

  const metadata = metadataQuery.data;
  const daily = dailyQuery.data ?? [];
  const insights = useLinkInsights(daily);
  const status = metadata ? getStatusLabel(metadata) : "active";

  useEffect(() => {
    if (!metadata) {
      return;
    }

    upsertKnownLink({
      shortCode: metadata.shortCode,
      shortUrl: getPublicShortLink(metadata.shortCode),
      originalUrl: metadata.originalUrl,
      createdAt: metadata.createdAt,
      expiresAt: metadata.expiresAt,
      isPasswordProtected: metadata.isPasswordProtected,
      clickCount: metadata.clickCount,
      lastAccessedAt: metadata.lastAccessedAt
    });
  }, [metadata, upsertKnownLink]);

  const openLink = useMemo(() => {
    if (!metadata) {
      return "#";
    }

    const password = metadata.isPasswordProtected ? redirectPassword : undefined;
    return getPublicShortLink(metadata.shortCode, password);
  }, [metadata, redirectPassword]);

  if (metadataQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }

  if (metadataQuery.isError || !metadata) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-lg font-semibold text-ink-800 dark:text-ink-100">Unable to load link</p>
          <p className="muted-text mt-1">This short code may not exist anymore.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </Button>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-2xl">/{metadata.shortCode}</CardTitle>
            <p className="muted-text max-w-2xl break-all">{metadata.originalUrl}</p>
            <div className="flex items-center gap-2">
              <Badge variant={status}>{status}</Badge>
              <span className="text-xs text-ink-500 dark:text-ink-400">Created {formatDateTime(metadata.createdAt)}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <CopyButton value={getPublicShortLink(metadata.shortCode)} label="Copy short URL" />
            <Button variant="secondary" onClick={() => openEditDialog(metadata.shortCode)}>
              Edit settings
            </Button>
            <Button
              variant="outline"
              onClick={() => void deleteMutation.mutateAsync()}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {metadata.isPasswordProtected ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                <LockKeyhole className="h-4 w-4" />
                Redirect testing requires password
              </p>
              <Input
                type="password"
                value={redirectPassword}
                onChange={(event) => setRedirectPassword(event.target.value)}
                placeholder="Enter password"
                className="max-w-sm"
              />
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild className="animate-glow">
              <a
                href={openLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => {
                  setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ["stats", shortCode] });
                    queryClient.invalidateQueries({ queryKey: ["daily", shortCode] });
                    queryClient.invalidateQueries({ queryKey: ["link", shortCode] });
                  }, 1200);
                }}
              >
                <ExternalLink className="h-4 w-4" />
                Open Link
              </a>
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/links/${shortCode}/analytics`}>Deep analytics view</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Clicks" value={summaryQuery.data?.clickCount ?? metadata.clickCount} trend="up" />
        <StatsCard title="Avg Clicks / Day" value={insights.avgPerDay.toFixed(1)} />
        <StatsCard title="Last Accessed" value={formatDateTime(summaryQuery.data?.lastAccessedAt)} />
        <StatsCard title="Days Tracked" value={daily.length} deltaText="Analytics windows" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Performance Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="line">
            <TabsList>
              <TabsTrigger value="line">Line</TabsTrigger>
              <TabsTrigger value="bar">Bar</TabsTrigger>
            </TabsList>
            <TabsContent value="line">
              {daily.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center text-sm text-ink-500">
                  No analytics yet. Open the link to generate click events.
                </div>
              ) : (
                <LineChart data={daily} />
              )}
            </TabsContent>
            <TabsContent value="bar">
              {daily.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center text-sm text-ink-500">
                  No daily bars yet. Trigger clicks to populate this chart.
                </div>
              ) : (
                <BarChart data={daily} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
