import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }): JSX.Element {
  return <div className={cn("animate-pulse rounded-xl bg-ink-200/70 dark:bg-ink-700", className)} />;
}
