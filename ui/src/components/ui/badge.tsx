import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
  {
    variants: {
      variant: {
        active: "bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300",
        expired: "bg-ink-200 text-ink-700 dark:bg-ink-800 dark:text-ink-300",
        protected: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
        neutral: "bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300"
      }
    },
    defaultVariants: {
      variant: "neutral"
    }
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps): JSX.Element {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
