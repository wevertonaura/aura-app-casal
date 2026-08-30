import { MessageCircle, Smartphone, Sparkles } from "lucide-react";
import { requireCoupleUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { connectWhatsappAction, disconnectWhatsappAction } from "@/actions/whatsapp";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatBubble } from "@/components/whatsapp/ChatBubble";
import { SimulateChat } from "@/components/whatsapp/SimulateChat";

export default async function AuraWhatsappPage() {
  const user = await requireCoupleUser();

  if (!user.whatsappConnected) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Aura WhatsApp</h1>
          <p className="text-sm text-text-muted">
            Conecte seu WhatsApp à Aura e organize suas finanças diretamente pelo WhatsApp.
          </p>
        </div>

        <Card className="glow-lilac">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lilac to-marsala text-white">
              <MessageCircle className="h-6 w-6" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-text">Conectar WhatsApp</h2>
              <p className="text-sm text-text-muted">Leva menos de um minuto.</p>
            </div>
          </div>

          <ol className="mb-6 space-y-3 text-sm text-text-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-text">1</span>
              Informe o número de WhatsApp de vocês.
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-text">2</span>
              A Aura confirma a conexão (simulada nesta versão do MVP).
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-hover text-xs font-semibold text-text">3</span>
              Pronto! Vocês já podem mandar mensagem pra Aura registrar tudo.
            </li>
          </ol>

          <form action={connectWhatsappAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Field label="Número de WhatsApp" htmlFor="phone" className="flex-1">
              <Input id="phone" name="phone" type="tel" placeholder="+55 11 91234-5678" required />
            </Field>
            <Button type="submit">Conectar WhatsApp</Button>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como vai funcionar</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            <ChatBubble direction="in" text="Aura, gastei R$ 80 no mercado." />
            <ChatBubble direction="out" text="✅ Registrei R$ 80,00 em Alimentação (mercado)." />
            <ChatBubble direction="in" text="Quanto ainda posso gastar esse mês?" />
            <ChatBubble direction="out" text="💰 Vocês ainda podem gastar R$ 1.240,00 este mês." />
          </div>
        </Card>
      </div>
    );
  }

  const messages = await db.whatsappMessage.findMany({
    where: { coupleId: user.coupleId! },
    orderBy: { createdAt: "asc" },
    take: 100,
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Aura WhatsApp</h1>
          <p className="text-sm text-text-muted">{user.whatsappNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="success">🟢 Conectado</Badge>
          <form action={disconnectWhatsappAction}>
            <Button type="submit" variant="ghost" size="sm">
              Desconectar
            </Button>
          </form>
        </div>
      </div>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-lilac" /> Conversa com a Aura
          </CardTitle>
        </CardHeader>

        <div className="mb-4 flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-faint">
              Ainda não há mensagens. Use o campo abaixo para simular uma conversa.
            </p>
          ) : (
            messages.map((m) => (
              <ChatBubble
                key={m.id}
                direction={m.direction}
                text={m.text}
                time={m.createdAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              />
            ))
          )}
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs text-text-faint">
            <Smartphone className="h-3.5 w-3.5" /> Simulando o app do WhatsApp — em produção, isso acontece de verdade no seu WhatsApp.
          </p>
          <SimulateChat />
        </div>
      </Card>
    </div>
  );
}
