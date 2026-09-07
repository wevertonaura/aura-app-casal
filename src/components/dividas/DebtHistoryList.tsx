import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, formatDayMonthShort } from "@/lib/format";

export function DebtHistoryList({
  history,
}: {
  history: { id: string; debtName: string; amount: number; date: Date }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de pagamentos</CardTitle>
      </CardHeader>
      {history.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-faint">Nenhum pagamento registrado ainda.</p>
      ) : (
        <ul className="divide-y divide-border">
          {history.map((h) => (
            <li key={h.id} className="flex items-center gap-4 py-3">
              <span className="w-14 shrink-0 text-xs font-medium uppercase text-text-faint">
                {formatDayMonthShort(h.date)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-text">{h.debtName}</p>
                <p className="text-xs text-text-faint">Pagamento realizado</p>
              </div>
              <span className="shrink-0 text-sm font-medium text-danger">-{formatCurrency(h.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
