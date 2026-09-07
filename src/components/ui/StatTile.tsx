import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneColor = {
    neutral: "text-lilac bg-lilac/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-danger bg-danger/10",
  }[tone];

  return (
    <div className="card-glass card-glass-hover min-w-0 p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        {Icon && (
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", toneColor)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 truncate font-display text-xl font-semibold text-text sm:text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-faint">{sub}</p>}
    </div>
  );
}
