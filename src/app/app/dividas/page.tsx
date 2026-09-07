import { requireCoupleUser } from "@/lib/auth";
import { getCoupleSnapshot } from "@/lib/finance";
import { toNumberValue } from "@/lib/format";
import { deleteDebtAction, registerDebtPaymentAction } from "@/actions/debts";
import { Badge } from "@/components/ui/Badge";
import { DebtSummaryCards } from "@/components/dividas/DebtSummaryCards";
import { DebtPlanHighlight } from "@/components/dividas/DebtPlanHighlight";
import { NewDebtCard } from "@/components/dividas/NewDebtCard";
import { DebtCard } from "@/components/dividas/DebtCard";
import { DebtHistoryList } from "@/components/dividas/DebtHistoryList";
import { EmptyDebtsState } from "@/components/dividas/EmptyDebtsState";

export default async function DividasPage() {
  const user = await requireCoupleUser();
  const snap = await getCoupleSnapshot(user.coupleId!);
  const hasDebts = snap.debts.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Dívidas</h1>
          <p className="mt-1 text-sm text-text-muted">
            Tenha clareza sobre {snap.couple.mode === "individual" ? "o que você deve" : "o que vocês devem"} e saiba
            exatamente como quitar.
          </p>
        </div>
        {hasDebts && (
          <div className="text-right">
            <p className="text-xs text-text-faint">Plano de quitação</p>
            <Badge tone="success">Em andamento</Badge>
          </div>
        )}
      </div>

      {!hasDebts ? (
        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <div id="nova-divida">
            <NewDebtCard />
          </div>
          <EmptyDebtsState />
        </div>
      ) : (
        <>
          <DebtSummaryCards
            totalAmount={snap.debtsTotal}
            monthlyCommitment={snap.debtsMonthlyTotal}
            payoffMonths={snap.debtsPayoffMonths}
            progressPct={snap.debtsProgressPct}
          />

          <DebtPlanHighlight
            monthlyCommitment={snap.debtsMonthlyTotal}
            payoffMonths={snap.debtsPayoffMonths}
            progressPct={snap.debtsProgressPct}
            paidTotal={snap.debtsPaidTotal}
            totalAmount={snap.debtsTotal}
          />

          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div id="nova-divida">
              <NewDebtCard />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {snap.debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={{
                    id: debt.id,
                    name: debt.name,
                    totalAmount: toNumberValue(debt.totalAmount),
                    monthlyPayment: toNumberValue(debt.monthlyPayment),
                    paidAmount: debt.paidAmount,
                    remainingAmount: debt.remainingAmount,
                    progressPct: debt.progressPct,
                    remainingPayoffMonths: debt.remainingPayoffMonths ?? 0,
                  }}
                  onRegisterPayment={registerDebtPaymentAction}
                  onDelete={deleteDebtAction}
                />
              ))}
            </div>
          </div>

          <DebtHistoryList history={snap.debtPaymentsHistory} />
        </>
      )}
    </div>
  );
}

