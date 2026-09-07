import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatCurrency } from "@/lib/format";

export function DebtPlanHighlight({
  monthlyCommitment,
  payoffMonths,
  progressPct,
  paidTotal,
  totalAmount,
}: {
  monthlyCommitment: number;
  payoffMonths: number;
  progressPct: number;
  paidTotal: number;
  totalAmount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu plano de quitação</CardTitle>
        <Badge tone="success">Em andamento</Badge>
      </CardHeader>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-muted">
            Você está pagando <span className="font-semibold text-text">{formatCurrency(monthlyCommitment)}/mês</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Estimativa para quitar todas as dívidas:{" "}
            <span className="font-semibold text-text">
              {payoffMonths > 0 ? `${payoffMonths} ${payoffMonths === 1 ? "mês" : "meses"}` : "quitado"}
            </span>
          </p>
        </div>
        <p className="max-w-xs text-sm text-text-faint sm:text-right">
          Continue mantendo esse ritmo. Cada pagamento aproxima vocês da liberdade financeira.
        </p>
      </div>

      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-text-muted">
          <span>
            {formatCurrency(paidTotal)} de {formatCurrency(totalAmount)} quitados
          </span>
          <span className="font-medium text-text">{progressPct.toFixed(0)}%</span>
        </div>
        <ProgressBar value={progressPct} tone="success" />
      </div>
    </Card>
  );
}
