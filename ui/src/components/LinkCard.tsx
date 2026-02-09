import { Calendar, ExternalLink, KeyRound, MoreVertical, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { formatDateTime, getStatusLabel } from "@/lib/utils";
import type { KnownLink } from "@/store/links-store";
import { CopyButton } from "./CopyButton";

type LinkCardProps = {
  link: KnownLink;
  onEdit: (shortCode: string) => void;
};

export function LinkCard({ link, onEdit }: LinkCardProps): JSX.Element {
  const status = getStatusLabel(link);

  return (
    <Card className="transition duration-200 hover:-translate-y-0.5 hover:shadow-soft">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">/{link.shortCode}</CardTitle>
            <p className="muted-text truncate">{link.originalUrl}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={status}>{status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={`/links/${link.shortCode}`}>View details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/links/${link.shortCode}/analytics`}>View analytics</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(link.shortCode)}>Edit settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-ink-600">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {formatDateTime(link.createdAt)}
          </span>
          <span className="inline-flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {link.clickCount} clicks
          </span>
          {link.isPasswordProtected ? (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <KeyRound className="h-3.5 w-3.5" />
              Protected
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <CopyButton value={link.shortUrl} label="Copy URL" />
          <Button asChild variant="outline" size="sm">
            <a href={link.shortUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
