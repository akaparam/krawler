import { useMemo } from "react";
import type { KnownLink } from "@/store/links-store";

export type ActivityItem = {
  id: string;
  message: string;
  timestamp: string;
};

export function useActivityFeed(links: KnownLink[]): ActivityItem[] {
  return useMemo(() => {
    const recent = [...links]
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
      .slice(0, 6);

    if (recent.length === 0) {
      return [];
    }

    return recent.map((link, index) => ({
      id: `${link.shortCode}-${index}`,
      message:
        index % 2 === 0
          ? `Link ${link.shortCode} collected ${Math.max(link.clickCount, 1)} clicks`
          : `New short link /${link.shortCode} published`,
      timestamp: link.lastAccessedAt ?? link.createdAt
    }));
  }, [links]);
}
