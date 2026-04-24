import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="status" aria-live="polite" aria-busy="true" className={cn("skeleton rounded-md", className)} {...props} />;
}
