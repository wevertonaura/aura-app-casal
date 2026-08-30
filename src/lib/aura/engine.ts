import { db } from "@/lib/db";
import { getCoupleSnapshot } from "@/lib/finance";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { parseAuraMessage, type ExpenseCategoryGuess } from "@/lib/aura/parseMessage";
import { whatsappClient } from "@/lib/aura/whatsapp-client";
import type { ExpenseCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<ExpenseCategoryGuess, string> = {
  alimentacao: "Alimentação",
  transporte: "Transporte",
  lazer: "Lazer",
  compras: "Compras",
  outros: "Outros",
};

function endOfCurrentYear(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), 11, 31);
}

/**
 * Ponto de entrada único para uma mensagem "recebida" da Aura no WhatsApp —
 * usado tanto pelo simulador dentro do app quanto (no futuro) por um
 * webhook real. Interpreta a intenção, grava/consulta no banco e devolve
 * o texto de resposta, sempre logando os dois lados da conversa.
 */
export async function handleAuraMessage(params: {
  coupleId: string;
  userId: string;
  userPhone?: string | null;
  text: string;
}): Promise<string> {
  const { coupleId, userId, text } = params;

  await db.whatsappMessage.create({ data: { coupleId, direction: "in", text } });

  const intent = parseAuraMessage(text);
  let reply: string;
  let relatedType = "none";

  switch (intent.type) {
    case "add_expense": {
      await db.expense.create({
        data: {
          coupleId,
          userId,
          description: intent.description,
          amount: intent.amount,
          category: intent.category as ExpenseCategory,
          date: new Date(),
          source: "whatsapp",
        },
      });
      reply = `✅ Registrei ${formatCurrency(intent.amount)} em ${CATEGORY_LABELS[intent.category]} (${intent.description}).`;
      relatedType = "expense";
      break;
    }
    case "add_installment_bill": {
      await db.fixedBill.create({
        data: {
          coupleId,
          name: intent.description,
          amount: intent.amount,
          category: "parcela",
          totalInstallments: intent.installments,
          startDate: new Date(),
        },
      });
      reply = `✅ Anotei: ${intent.description} em ${intent.installments}x de ${formatCurrency(intent.amount)}. Já apareceu em Contas Fixas.`;
      relatedType = "fixedbill";
      break;
    }
    case "create_goal": {
      const targetDate = intent.targetDate ?? endOfCurrentYear();
      await db.goal.create({
        data: { coupleId, name: intent.name, targetAmount: intent.amount, targetDate },
      });
      reply = `🎯 Sonho criado: ${intent.name} — ${formatCurrency(intent.amount)} até ${formatMonthYear(targetDate)}. Já está em Sonhos.`;
      relatedType = "goal";
      break;
    }
    case "query_balance": {
      const snap = await getCoupleSnapshot(coupleId);
      reply = `💰 Vocês ainda podem gastar ${formatCurrency(Math.max(0, snap.available))} este mês (renda de ${formatCurrency(snap.coupleIncome)} menos contas fixas e gastos já lançados).`;
      relatedType = "query";
      break;
    }
    case "query_debts": {
      const snap = await getCoupleSnapshot(coupleId);
      reply =
        snap.debts.length === 0
          ? "🎉 Vocês não têm dívidas cadastradas."
          : `📋 Vocês têm ${formatCurrency(snap.debtsTotal)} em dívidas, com ${formatCurrency(snap.debtsMonthlyTotal)}/mês planejados para pagamento.`;
      relatedType = "query";
      break;
    }
    case "query_leisure_budget": {
      const snap = await getCoupleSnapshot(coupleId);
      const remaining = snap.leisureBudget - snap.leisureSpent;
      reply =
        snap.leisureBudget <= 0
          ? "Vocês ainda não definiram um limite de lazer. Configure em Contas Fixas → Lazer."
          : remaining < 0
            ? `⚠️ O orçamento de lazer estourou em ${formatCurrency(Math.abs(remaining))} este mês.`
            : `⚠️ Restam ${formatCurrency(remaining)} do orçamento de lazer este mês.`;
      relatedType = "query";
      break;
    }
    case "query_expenses": {
      const snap = await getCoupleSnapshot(coupleId);
      reply = `🧾 Vocês já gastaram ${formatCurrency(snap.monthExpensesTotal)} este mês, em ${snap.expenses.length} lançamento(s).`;
      relatedType = "query";
      break;
    }
    default:
      reply =
        '🤔 Não entendi. Você pode dizer, por exemplo: "gastei R$ 80 no mercado", "comprei um celular em 10x de R$ 350", "quanto ainda posso gastar esse mês?" ou "quanto temos de dívida?".';
  }

  await db.whatsappMessage.create({ data: { coupleId, direction: "out", text: reply, relatedType } });
  if (params.userPhone) {
    await whatsappClient.sendMessage(params.userPhone, reply);
  }

  return reply;
}
