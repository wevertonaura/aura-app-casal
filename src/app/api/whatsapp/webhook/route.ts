import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { handleAuraMessage } from "@/lib/aura/engine";
import { normalizePhoneBR } from "@/lib/phone";

/**
 * Extrai remetente e texto do payload de webhook do UAZAPI (evento
 * "messages"). O formato exato de cada wrapper (Baileys por baixo) pode
 * variar um pouco entre versões, então checamos os caminhos mais comuns em
 * vez de assumir um único shape — se o UAZAPI mudar algo, é só ajustar
 * aqui, o resto do fluxo (parser + engine) não muda.
 *
 * Ver console do servidor (preview_logs) no primeiro teste real pra
 * confirmar/ajustar os campos caso a extração venha vazia.
 */
function extractIncoming(body: unknown): { from: string; text: string; fromMe: boolean } | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  // Aceita tanto o payload "cru" do evento quanto {message: {...}} / {data: {...}}.
  const msg = (b.message ?? b.data ?? b) as Record<string, unknown>;

  // Em chats diretos, "sender" às vezes vem como @lid (identificador de
  // privacidade do WhatsApp, não o número) — "sender_pn" e "chatid" são o
  // número de telefone de verdade, então têm prioridade.
  const sender =
    (typeof msg.sender_pn === "string" && msg.sender_pn) ||
    (typeof msg.chatid === "string" && msg.chatid) ||
    (typeof msg.sender === "string" && msg.sender) ||
    (typeof b.from === "string" && b.from) ||
    null;

  const text =
    (typeof msg.text === "string" && msg.text) ||
    (typeof msg.conversation === "string" && msg.conversation) ||
    (typeof msg.content === "string" && msg.content) ||
    (typeof b.text === "string" && b.text) ||
    null;

  if (!sender || !text) return null;

  const fromMe = msg.fromMe === true || b.fromMe === true;
  const from = normalizePhoneBR(sender.split("@")[0]);

  return { from, text, fromMe };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  // Só nos interessa o evento de mensagem recebida — outros eventos
  // (connection, presence, etc.) respondem 200 sem fazer nada.
  const eventType = (body as Record<string, unknown> | null)?.EventType ?? (body as Record<string, unknown> | null)?.event;
  if (eventType && eventType !== "messages") {
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  const incoming = extractIncoming(body);
  if (!incoming) {
    return NextResponse.json({ error: "Não consegui extrair remetente/texto do payload." }, { status: 400 });
  }
  // Mensagens enviadas pela própria Aura (respostas) não devem virar um novo turno.
  if (incoming.fromMe) {
    return NextResponse.json({ ok: true, skipped: "fromMe" });
  }

  const users = await db.user.findMany({ where: { whatsappConnected: true, whatsappNumber: { not: null } } });
  const user = users.find((u) => normalizePhoneBR(u.whatsappNumber ?? "") === incoming.from);

  if (!user || !user.coupleId) {
    return NextResponse.json({ error: "Número não conectado à Aura." }, { status: 404 });
  }

  const reply = await handleAuraMessage({
    coupleId: user.coupleId,
    userId: user.id,
    userPhone: user.whatsappNumber,
    text: incoming.text,
  });

  return NextResponse.json({ reply });
}
