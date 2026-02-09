export type CreateLinkRequest = {
  url: string;
  customSlug?: string;
  expiresAt?: string;
  password?: string;
};

export type CreateLinkResponse = {
  shortCode: string;
  shortUrl: string;
};

export type UpdateLinkRequest = {
  expiresAt?: string | null;
  password?: string;
  removePassword?: boolean;
};

export type LinkMetadata = {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt?: string;
  isPasswordProtected: boolean;
  clickCount: number;
  lastAccessedAt?: string | null;
};

export type LinkStatsSummary = {
  clickCount: number;
  lastAccessedAt: string | null;
};

export type DailyStat = {
  date: string;
  count: number;
};

export type ApiError = {
  message: string;
};
