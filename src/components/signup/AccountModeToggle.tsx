"use client";

import { useState } from "react";
import { Users, User } from "lucide-react";
import { cn } from "@/lib/cn";

export type AccountMode = "conjunto" | "individual";

const OPTIONS: { value: AccountMode; label: string; icon: typeof Users; desc: string }[] = [
  {
    value: "conjunto",
    label: "Conjunto",
    icon: Users,
    desc: "Você convida seu parceiro(a) e organizam as finanças juntos.",
  },
  {
    value: "individual",
    label: "Individual",
    icon: User,
    desc: "Só você. Sem precisar de parceiro(a) pra usar a Aura.",
  },
];

export function AccountModeToggle({ defaultValue = "conjunto" }: { defaultValue?: AccountMode }) {
  const [mode, setMode] = useState<AccountMode>(defaultValue);
  const active = OPTIONS.find((o) => o.value === mode)!;

  return (
    <div>
      <input type="hidden" name="mode" value={mode} />
      <label className="mb-1.5 block text-sm font-medium text-text-muted">Como você vai usar a Aura?</label>
      <div className="flex gap-1 rounded-full border border-border-strong bg-bg-elevated p-1">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const isActive = o.value === mode;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => setMode(o.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-surface text-text shadow-sm" : "text-text-faint hover:text-text-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              {o.label}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs text-text-faint">{active.desc}</p>
    </div>
  );
}
