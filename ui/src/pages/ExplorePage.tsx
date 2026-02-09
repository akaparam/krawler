import { Link } from "react-router-dom";
import { Eye, Filter, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getStatusLabel, isExpired } from "@/lib/utils";
import { useLinksStore } from "@/store/links-store";

export default function ExplorePage(): JSX.Element {
  const links = useLinksStore((state) => state.knownLinks);
  const filters = useLinksStore((state) => state.explorerFilters);
  const setFilters = useLinksStore((state) => state.setExplorerFilters);

  const filtered = links.filter((link) => {
    const matchesSearch =
      !filters.search ||
      link.shortCode.toLowerCase().includes(filters.search.toLowerCase()) ||
      link.originalUrl.toLowerCase().includes(filters.search.toLowerCase());

    const status = getStatusLabel(link);
    const matchesStatus = filters.status === "all" || status === filters.status;

    const matchesDate =
      !filters.createdAfter || Date.parse(link.createdAt) >= Date.parse(filters.createdAfter);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-sky-600" />
            Global Link Explorer
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
            <Input
              placeholder="Search code or URL"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
              className="pl-9"
            />
          </div>

          <select
            value={filters.status}
            onChange={(event) =>
              setFilters({ status: event.target.value as "all" | "active" | "expired" | "protected" })
            }
            className="h-10 rounded-xl border border-ink-200 bg-white px-3 text-sm text-ink-700"
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="protected">Protected</option>
          </select>

          <Input
            type="date"
            value={filters.createdAfter}
            onChange={(event) => setFilters({ createdAfter: event.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Links ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-ink-200 bg-ink-50 p-8 text-center">
              <p className="text-sm font-semibold text-ink-700">No links match your filters.</p>
              <p className="muted-text mt-1">Create links from dashboard and they will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-ink-400">
                    <th className="px-3">Short Code</th>
                    <th className="px-3">Destination</th>
                    <th className="px-3">Status</th>
                    <th className="px-3">Clicks</th>
                    <th className="px-3">Created</th>
                    <th className="px-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((link) => {
                    const status = getStatusLabel(link);
                    return (
                      <tr key={link.shortCode} className="rounded-xl bg-white shadow-sm">
                        <td className="rounded-l-xl px-3 py-3 font-mono text-xs">/{link.shortCode}</td>
                        <td className="max-w-sm truncate px-3 py-3 text-ink-600">{link.originalUrl}</td>
                        <td className="px-3 py-3">
                          <Badge variant={status}>{status}</Badge>
                        </td>
                        <td className="px-3 py-3">{link.clickCount}</td>
                        <td className="px-3 py-3 text-ink-500">{new Date(link.createdAt).toLocaleDateString()}</td>
                        <td className="rounded-r-xl px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/links/${link.shortCode}`}>
                                <Eye className="h-3.5 w-3.5" />
                                Open
                              </Link>
                            </Button>
                            {isExpired(link.expiresAt) ? (
                              <span className="text-xs text-amber-700">expired</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
