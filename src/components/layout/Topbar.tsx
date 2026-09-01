import { formatCurrency } from "@/lib/format";

export function Topbar({
  members,
  coupleIncome,
  individual = false,
}: {
  members: { name: string; monthlyIncome: number; avatarUrl?: string | null }[];
  coupleIncome: number;
  individual?: boolean;
}) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-border bg-bg-elevated/60 px-4 py-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-2 lg:hidden">
        <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
        <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
      </div>

      <div className="ml-auto flex items-center gap-4">
        <div className="hidden text-right sm:block">
          <p className="text-xs text-text-faint">{individual ? "Renda" : "Renda do casal"}</p>
          <p className="font-display text-sm font-semibold text-text">{formatCurrency(coupleIncome)}</p>
        </div>
        <div className="flex -space-x-2">
          {members.map((m) => (
            <span
              key={m.name}
              title={`${m.name} — ${formatCurrency(m.monthlyIncome)}`}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-bg-elevated bg-gradient-to-br from-lilac to-marsala text-xs font-semibold text-white"
            >
              {m.name.charAt(0).toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
