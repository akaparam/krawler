export interface LinkItem {
  PK: string;
  SK: "METADATA";
  entityType: "LINK";
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: number;
  passwordHash?: string;
  clickCount: number;
  lastAccessedAt?: string;
}

export interface DailyStatsItem {
  PK: string;
  SK: string;
  entityType: "DAILY_STATS";
  date: string;
  count: number;
}
