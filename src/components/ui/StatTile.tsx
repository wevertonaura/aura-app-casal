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
    neutral: "text-lilac",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  }[tone];

  return (
    <div className="card-glass min-w-0 p-5">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</span>
        {Icon && <Icon className={cn("h-4 w-4", toneColor)} />}
      </div>
      <p className="mt-2 truncate font-display text-xl font-semibold text-text sm:text-2xl">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-faint">{sub}</p>}
    </div>
  );
}
