import { db } from "@/lib/db";
import { nextDueDate, daysUntil, installmentsInfo } from "@/lib/calc";
import { formatCurrency, formatDate } from "@/lib/format";
import { whatsappClient } from "@/lib/aura/whatsapp-client";

const REMINDER_DAYS_BEFORE = 3;

/**
 * Roda uma vez por dia (via /api/cron/bill-reminders): acha toda conta fixa
 * ativa que vence daqui a exatos `REMINDER_DAYS_BEFORE` dias e manda um
 * lembrete no WhatsApp pra cada pessoa do casal com número conectado.
 *
 * Idempotente: `FixedBillReminder` tem unique (fixedBillId, dueDate), então
 * rodar o cron mais de uma vez no mesmo dia não duplica mensagem.
 */
export async function sendDueBillReminders(now = new Date()): Promise<{ checked: number; sent: number }> {
  const bills = await db.fixedBill.findMany({
    include: { couple: { include: { users: true } } },
  });

  let sent = 0;

  for (const bill of bills) {
    const installments = installmentsInfo(bill.startDate, bill.totalInstallments, now);
    if (installments.finished) continue;

    const dueDate = nextDueDate(bill.dueDay, now);
    if (daysUntil(dueDate, now) !== REMINDER_DAYS_BEFORE) continue;

    const alreadySent = await db.fixedBillReminder.findUnique({
      where: { fixedBillId_dueDate: { fixedBillId: bill.id, dueDate } },
    });
    if (alreadySent) continue;

    const recipients = bill.couple.users.filter((u) => u.whatsappConnected && u.whatsappNumber);
    const text = `🔔 Lembrete da Aura: *${bill.name}* (${formatCurrency(bill.amount)}) vence em ${REMINDER_DAYS_BEFORE} dias, dia ${formatDate(dueDate)}.`;

    for (const recipient of recipients) {
      await whatsappClient.sendMessage(recipient.whatsappNumber!, text);
      await db.whatsappMessage.create({
        data: { coupleId: bill.coupleId, direction: "out", text, relatedType: "fixedbill_reminder" },
      });
    }

    // Marca como enviado mesmo se ninguém tinha WhatsApp conectado ainda —
    // evita reprocessar a mesma conta/dia toda vez que o cron rodar.
    await db.fixedBillReminder.create({ data: { fixedBillId: bill.id, dueDate } });
    if (recipients.length > 0) sent++;
  }

  return { checked: bills.length, sent };
}
