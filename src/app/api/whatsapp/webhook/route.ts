import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleAuraMessage } from "@/lib/aura/engine";

/**
 * Formato de webhook "genérico" — pensado para ser compatível com o shape
 * que a WhatsApp Business Cloud API (Meta) ou o Twilio mandariam: um número
 * de origem e o texto da mensagem. Hoje só é usado pelo simulador do app
 * (via Server Action), mas a rota já está pronta para receber tráfego real
 * assim que houver credenciais — troque a origem da chamada, o resto do
 * fluxo (parser + banco) não muda.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const from = typeof body?.from === "string" ? body.from : null;
  const text = typeof body?.text === "string" ? body.text : null;

  if (!from || !text) {
    return NextResponse.json({ error: "Campos 'from' e 'text' são obrigatórios." }, { status: 400 });
  }

  const user = await db.user.findFirst({
    where: { whatsappNumber: from, whatsappConnected: true },
  });

  if (!user || !user.coupleId) {
    return NextResponse.json({ error: "Número não conectado à Aura." }, { status: 404 });
  }

  const reply = await handleAuraMessage({
    coupleId: user.coupleId,
    userId: user.id,
    userPhone: user.whatsappNumber,
    text,
  });

  return NextResponse.json({ reply });
}
