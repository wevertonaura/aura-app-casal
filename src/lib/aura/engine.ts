import { db } from "@/lib/db";
import { getCoupleSnapshot } from "@/lib/finance";
import { formatCurrency, formatMonthYear } from "@/lib/format";
import { categoryLabel } from "@/lib/categories";
import { sumDecimal } from "@/lib/calc";
import { parseAuraMessage } from "@/lib/aura/parseMessage";
import { whatsappClient } from "@/lib/aura/whatsapp-client";

/** Remove acentos e caixa pra comparar "cartão" com "cartao" sem drama. */
function normalizeText(s: string): string {
  const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
  return s.toLowerCase().normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

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
          category: intent.category,
          date: new Date(),
          source: "whatsapp",
        },
      });
      reply = `✅ Registrei ${formatCurrency(intent.amount)} em ${categoryLabel(intent.category)} (${intent.description}).`;
      relatedType = "expense";

      // Alertas proativos — a Aura avisa sozinha, na hora, se esse gasto
      // estourou o orçamento de lazer ou deixou o saldo do mês negativo.
      // Não usa nenhuma API paga, só os números que já calculamos sempre.
      const snapAfter = await getCoupleSnapshot(coupleId);
      if (snapAfter.leisureBudget > 0 && snapAfter.leisureSpent > snapAfter.leisureBudget) {
        reply += `\n\n⚠️ Orçamento de lazer estourou em ${formatCurrency(snapAfter.leisureSpent - snapAfter.leisureBudget)} este mês.`;
      }
      if (snapAfter.available < 0) {
        reply += `\n\n🔴 Atenção: o saldo do mês ficou negativo em ${formatCurrency(Math.abs(snapAfter.available))}.`;
      }
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
    case "pay_debt": {
      const debts = await db.debt.findMany({ where: { coupleId }, include: { payments: true } });

      if (debts.length === 0) {
        reply = "Vocês ainda não têm nenhuma dívida cadastrada. Cadastre em Dívidas antes de mandar um pagamento.";
        relatedType = "debt";
        break;
      }

      const query = normalizeText(intent.debtQuery);
      const matches = query
        ? debts.filter((d) => {
            const name = normalizeText(d.name);
            return name.length > 0 && (query.includes(name) || name.includes(query));
          })
        : [];
      const target = matches.length === 1 ? matches[0] : debts.length === 1 ? debts[0] : null;

      if (!target) {
        const names = debts.map((d) => `"${d.name}"`).join(", ");
        reply = `Não consegui identificar qual dívida — vocês têm cadastrado: ${names}. Manda de novo citando o nome, tipo "paguei ${intent.amount} no ${debts[0].name}".`;
        relatedType = "debt";
        break;
      }

      const paidSoFar = sumDecimal(target.payments.map((p) => p.amount));
      const remainingBefore = Math.max(0, Number(target.totalAmount) - paidSoFar);
      await db.debtPayment.create({ data: { debtId: target.id, amount: intent.amount, date: new Date() } });
      const remainingAfter = Math.max(0, remainingBefore - intent.amount);

      reply =
        remainingAfter <= 0
          ? `✅ Registrei ${formatCurrency(intent.amount)} no ${target.name}. Vocês quitaram essa dívida! 🎉`
          : `✅ Registrei ${formatCurrency(intent.amount)} no ${target.name}. Faltam ${formatCurrency(remainingAfter)} pra quitar.`;
      relatedType = "debt";
      break;
    }
    case "create_debt": {
      await db.debt.create({
        data: {
          coupleId,
          name: intent.name,
          totalAmount: intent.totalAmount,
          monthlyPayment: intent.monthlyPayment,
        },
      });
      reply = `✅ Dívida registrada: ${intent.name} — ${formatCurrency(intent.totalAmount)}, pagando ${formatCurrency(intent.monthlyPayment)}/mês. Já está em Dívidas.`;
      relatedType = "debt";
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
        '🤔 Não entendi. Você pode dizer, por exemplo: "80 no mercado", "comprei um celular em 10x de R$ 350", "paguei 200 no cartão", "tenho uma dívida de 3000, pago 500 por mês", "quanto ainda posso gastar esse mês?" ou "quanto temos de dívida?".';
  }

  await db.whatsappMessage.create({ data: { coupleId, direction: "out", text: reply, relatedType } });
  if (params.userPhone) {
    await whatsappClient.sendMessage(params.userPhone, reply);
  }

  return reply;
}
