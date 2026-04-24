import * as Icons from "lucide-react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Insight = {
  title: string;
  body: string;
  tone: "positive" | "warning" | "neutral";
  icon: string;
};

export function InsightCard({ insight }: { insight: Insight }) {
  const IconComp =
    (Icons[insight.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }> | undefined) ?? Sparkles;

  const tone = insight.tone;

  return (
    <article
      className={cn(
        "rounded-2xl border p-5 flex flex-col gap-3",
        tone === "positive" && "border-success/20 bg-success-soft/50",
        tone === "warning" && "border-warning/20 bg-warning-soft/50",
        tone === "neutral" && "border-border bg-surface"
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 place-items-center rounded-lg",
          tone === "positive" && "bg-success-soft text-success",
          tone === "warning" && "bg-warning-soft text-warning",
          tone === "neutral" && "bg-muted text-muted-foreground"
        )}
      >
        <IconComp className="h-5 w-5" />
      </div>
      <h3 className="font-serif text-lg leading-snug">{insight.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{insight.body}</p>
    </article>
  );
}
