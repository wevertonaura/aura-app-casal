import { db } from "@/lib/db";
import { sumDecimal } from "@/lib/calc";
import { formatCurrency } from "@/lib/format";
import { whatsappClient } from "@/lib/aura/whatsapp-client";

// A partir de que dia do mês a Aura cobra quem ainda não pagou nada da
// dívida esse mês — dá tempo do casal pagar organicamente antes disso.
const REMINDER_DAY = 25;

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Roda uma vez por dia (via /api/cron/debt-reminders): a partir do dia
 * REMINDER_DAY, avisa o casal sobre toda dívida ainda não quitada que não
 * recebeu nenhum pagamento nesse mês.
 *
 * Idempotente: `DebtOverdueReminder` tem unique (debtId, monthKey), então
 * rodar o cron mais de uma vez no mesmo mês não duplica mensagem.
 */
export async function sendOverdueDebtReminders(now = new Date()): Promise<{ checked: number; sent: number }> {
  if (now.getDate() < REMINDER_DAY) return { checked: 0, sent: 0 };

  const debts = await db.debt.findMany({
    include: { payments: true, couple: { include: { users: true } } },
  });

  const key = monthKey(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  let sent = 0;

  for (const debt of debts) {
    const paid = sumDecimal(debt.payments.map((p) => p.amount));
    const remaining = Number(debt.totalAmount) - paid;
    if (remaining <= 0) continue; // já quitada

    const paidThisMonth = debt.payments.some((p) => p.date >= monthStart);
    if (paidThisMonth) continue;

    const alreadySent = await db.debtOverdueReminder.findUnique({
      where: { debtId_monthKey: { debtId: debt.id, monthKey: key } },
    });
    if (alreadySent) continue;

    const recipients = debt.couple.users.filter((u) => u.whatsappConnected && u.whatsappNumber);
    const text = `🔴 Lembrete da Aura: vocês ainda não registraram nenhum pagamento de *${debt.name}* esse mês (planejado: ${formatCurrency(debt.monthlyPayment)}/mês, faltam ${formatCurrency(remaining)} no total). Bora manter o ritmo?`;

    for (const recipient of recipients) {
      await whatsappClient.sendMessage(recipient.whatsappNumber!, text);
      await db.whatsappMessage.create({
        data: { coupleId: debt.coupleId, direction: "out", text, relatedType: "debt_overdue" },
      });
    }

    await db.debtOverdueReminder.create({ data: { debtId: debt.id, monthKey: key } });
    if (recipients.length > 0) sent++;
  }

  return { checked: debts.length, sent };
}
