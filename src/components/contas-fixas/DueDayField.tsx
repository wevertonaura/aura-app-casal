"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Check } from "lucide-react";
import { formatDueLabel } from "@/lib/format";
import { cn } from "@/lib/cn";

export function DueDayField({
  billId,
  dueDay,
  daysUntilDue,
  onUpdate,
}: {
  billId: string;
  dueDay: number;
  daysUntilDue: number;
  onUpdate: (formData: FormData) => Promise<void>;
}) {
  const [value, setValue] = useState(dueDay);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleBlur() {
    const clamped = Math.min(31, Math.max(1, value || dueDay));
    setValue(clamped);
    if (clamped === dueDay) return;

    const formData = new FormData();
    formData.set("id", billId);
    formData.set("dueDay", String(clamped));
    startTransition(async () => {
      await onUpdate(formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  }

  const urgent = daysUntilDue <= 3;

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", urgent ? "text-warning" : "text-text-faint")}>
      <CalendarClock className="h-3 w-3 shrink-0" />
      <span>Vence dia</span>
      <input
        type="number"
        min={1}
        max={31}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        onBlur={handleBlur}
        aria-label="Dia do vencimento"
        className="w-9 rounded border border-border-strong bg-surface px-1 py-0.5 text-center text-text outline-none focus:border-lilac"
      />
      <span>· {formatDueLabel(daysUntilDue)}</span>
      {isPending && <span className="text-text-faint">salvando…</span>}
      {saved && <Check className="h-3 w-3 text-success" />}
    </div>
  );
}
