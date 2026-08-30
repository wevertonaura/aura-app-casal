import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function inviteCode(): string {
  return randomBytes(3).toString("hex").toUpperCase();
}

async function main() {
  await db.whatsappMessage.deleteMany();
  await db.expense.deleteMany();
  await db.fixedBill.deleteMany();
  await db.debt.deleteMany();
  await db.goal.deleteMany();
  await db.session.deleteMany();
  await db.user.deleteMany();
  await db.couple.deleteMany();

  const couple = await db.couple.create({
    data: { inviteCode: inviteCode(), leisureBudget: 500 },
  });

  const ana = await db.user.create({
    data: {
      name: "Ana",
      email: "ana@aura.app",
      passwordHash: hashPassword("123456"),
      monthlyIncome: 4000,
      coupleId: couple.id,
      whatsappConnected: true,
      whatsappNumber: "+55 11 91234-5678",
    },
  });

  const paulo = await db.user.create({
    data: {
      name: "Paulo",
      email: "paulo@aura.app",
      passwordHash: hashPassword("123456"),
      monthlyIncome: 3920,
      coupleId: couple.id,
    },
  });

  const now = new Date();
  const day = (d: number) => new Date(now.getFullYear(), now.getMonth(), d);

  await db.expense.createMany({
    data: [
      { coupleId: couple.id, userId: ana.id, description: "Mercado do mês", amount: 412.5, category: "alimentacao", date: day(3) },
      { coupleId: couple.id, userId: paulo.id, description: "Uber", amount: 38.9, category: "transporte", date: day(4) },
      { coupleId: couple.id, userId: ana.id, description: "Cinema", amount: 92.0, category: "lazer", date: day(6) },
      { coupleId: couple.id, userId: paulo.id, description: "iFood", amount: 76.4, category: "alimentacao", date: day(9) },
      { coupleId: couple.id, userId: ana.id, description: "Roupas", amount: 245.0, category: "compras", date: day(11) },
      { coupleId: couple.id, userId: paulo.id, description: "Show", amount: 180.0, category: "lazer", date: day(13) },
      { coupleId: couple.id, userId: ana.id, description: "Farmácia", amount: 58.3, category: "outros", date: day(15) },
      { coupleId: couple.id, userId: paulo.id, description: "Combustível", amount: 190.7, category: "transporte", date: day(16) },
    ],
  });

  await db.fixedBill.createMany({
    data: [
      { coupleId: couple.id, name: "Aluguel", amount: 1800, category: "aluguel", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      { coupleId: couple.id, name: "Água", amount: 90, category: "agua", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      { coupleId: couple.id, name: "Luz", amount: 210, category: "luz", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      { coupleId: couple.id, name: "Internet", amount: 120, category: "internet", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      { coupleId: couple.id, name: "Academia", amount: 160, category: "academia", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      { coupleId: couple.id, name: "Streaming", amount: 55.9, category: "assinatura", startDate: new Date(now.getFullYear(), now.getMonth() - 6, 1) },
      { coupleId: couple.id, name: "Celular", amount: 350, category: "parcela", totalInstallments: 10, startDate: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
    ],
  });

  await db.debt.create({
    data: {
      coupleId: couple.id,
      name: "Empréstimo pessoal",
      totalAmount: 15000,
      monthlyPayment: 500,
      startDate: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    },
  });

  await db.goal.create({
    data: {
      coupleId: couple.id,
      name: "Viagem",
      targetAmount: 2800,
      targetDate: new Date(now.getFullYear(), 11, 31),
      savedAmount: 600,
    },
  });

  await db.whatsappMessage.createMany({
    data: [
      { coupleId: couple.id, direction: "in", text: "Aura, gastei R$ 80 no mercado." },
      { coupleId: couple.id, direction: "out", text: "✅ Registrei R$ 80,00 em Alimentação (mercado).", relatedType: "expense" },
      { coupleId: couple.id, direction: "in", text: "Aura, quanto ainda posso gastar esse mês?" },
      { coupleId: couple.id, direction: "out", text: "💰 Vocês ainda podem gastar uma boa parte da renda este mês. Dá uma olhada no dashboard!", relatedType: "query" },
    ],
  });

  console.log("Seed concluído.");
  console.log(`Casal: ${couple.id} — código de convite: ${couple.inviteCode}`);
  console.log("Login: ana@aura.app / 123456  |  paulo@aura.app / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
