import { cn } from "@/lib/cn";

const tones = {
  lilac: "bg-gradient-to-r from-lilac to-marsala",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function ProgressBar({
  value,
  tone = "lilac",
  className,
}: {
  value: number;
  tone?: keyof typeof tones;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-hover", className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-500", tones[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
