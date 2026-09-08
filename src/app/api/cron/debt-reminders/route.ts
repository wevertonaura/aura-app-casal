import { NextResponse } from "next/server";
import { sendOverdueDebtReminders } from "@/lib/aura/debtReminders";

/**
 * Endpoint pensado pra ser chamado uma vez por dia por um agendador externo
 * (Vercel Cron — ver vercel.json na raiz). Mesma proteção por CRON_SECRET
 * que /api/cron/bill-reminders.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await sendOverdueDebtReminders();
  return NextResponse.json({ ok: true, ...result });
}
