import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getStatusLabel } from "@/lib/utils";
import type { LinkMetadata } from "@/types/api";

export type KnownLink = {
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  isPasswordProtected: boolean;
  clickCount: number;
  lastAccessedAt?: string | null;
};

export type ExplorerFilters = {
  search: string;
  status: "all" | "active" | "expired" | "protected";
  createdAfter: string;
};

type LinksState = {
  knownLinks: KnownLink[];
  explorerFilters: ExplorerFilters;
  upsertFromMetadata: (shortUrl: string, metadata: LinkMetadata) => void;
  upsertKnownLink: (link: KnownLink) => void;
  removeLink: (shortCode: string) => void;
  clearAll: () => void;
  setExplorerFilters: (patch: Partial<ExplorerFilters>) => void;
};

const defaultFilters: ExplorerFilters = {
  search: "",
  status: "all",
  createdAfter: ""
};

function normalizeKnownLink(link: KnownLink): KnownLink {
  return {
    ...link,
    clickCount: Number.isFinite(link.clickCount) ? link.clickCount : 0
  };
}

export const useLinksStore = create<LinksState>()(
  persist(
    (set, get) => ({
      knownLinks: [],
      explorerFilters: defaultFilters,
      upsertFromMetadata: (shortUrl, metadata) => {
        get().upsertKnownLink({
          shortCode: metadata.shortCode,
          shortUrl,
          originalUrl: metadata.originalUrl,
          createdAt: metadata.createdAt,
          expiresAt: metadata.expiresAt,
          isPasswordProtected: metadata.isPasswordProtected,
          clickCount: metadata.clickCount,
          lastAccessedAt: metadata.lastAccessedAt ?? null
        });
      },
      upsertKnownLink: (link) => {
        set((state) => {
          const normalized = normalizeKnownLink(link);
          const withoutCurrent = state.knownLinks.filter(
            (item) => item.shortCode !== normalized.shortCode
          );
          return {
            knownLinks: [normalized, ...withoutCurrent].sort(
              (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt)
            )
          };
        });
      },
      removeLink: (shortCode) => {
        set((state) => ({
          knownLinks: state.knownLinks.filter((item) => item.shortCode !== shortCode)
        }));
      },
      clearAll: () => {
        set({ knownLinks: [] });
      },
      setExplorerFilters: (patch) => {
        set((state) => ({
          explorerFilters: {
            ...state.explorerFilters,
            ...patch
          }
        }));
      }
    }),
    {
      name: "krawler-links-state"
    }
  )
);

export function getKpiMetrics(links: KnownLink[]): {
  totalClicks: number;
  activeLinks: number;
  expiredLinks: number;
  protectedLinks: number;
} {
  return links.reduce(
    (accumulator, link) => {
      accumulator.totalClicks += link.clickCount;
      const status = getStatusLabel(link);
      if (status === "active") {
        accumulator.activeLinks += 1;
      }
      if (status === "expired") {
        accumulator.expiredLinks += 1;
      }
      if (status === "protected") {
        accumulator.protectedLinks += 1;
      }
      return accumulator;
    },
    {
      totalClicks: 0,
      activeLinks: 0,
      expiredLinks: 0,
      protectedLinks: 0
    }
  );
}
