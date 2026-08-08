import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }) {
  return <div className={cn("skeleton-shimmer animate-shimmer rounded-md", className)} {...props} />;
}
