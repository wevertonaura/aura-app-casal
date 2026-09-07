"use client";

import { useEffect, useRef, useState } from "react";
import { ChatBubble } from "@/components/whatsapp/ChatBubble";

type Msg = { direction: "in" | "out"; text: string };

// Um recado por funcionalidade, na ordem: Gastos, Contas fixas, Dívidas, Sonhos, Dashboard.
const SCRIPT: Msg[] = [
  { direction: "in", text: "Aura, gastei R$ 80 no mercado." },
  { direction: "out", text: "✅ Registrei R$ 80,00 em Alimentação (mercado)." },
  { direction: "in", text: "Comprei um celular em 10x de R$ 350." },
  { direction: "out", text: "✅ Anotei: celular em 10x de R$ 350,00. Já está em Contas Fixas." },
  { direction: "in", text: "Tenho uma dívida de R$ 3.000 no cartão, quero pagar R$ 500 por mês." },
  { direction: "out", text: "📉 Registrei a dívida. Nesse ritmo vocês quitam em 6 meses." },
  { direction: "in", text: "Quero juntar R$ 6.000 pra uma viagem em 12 meses." },
  { direction: "out", text: "✈️ Sonho criado! Guardem R$ 500,00 por mês pra chegar lá." },
  { direction: "in", text: "Quanto ainda posso gastar esse mês?" },
  { direction: "out", text: "💰 Vocês ainda podem gastar R$ 1.240,00 este mês." },
];

const TYPING_MS = 1100;
const NEXT_MS = 900;
const RESTART_MS = 2800;

function TypingBubble() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-lilac/25 bg-lilac/10 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-lilac"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

export function AutoChat() {
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    function step(i: number) {
      if (cancelled) return;

      if (i >= SCRIPT.length) {
        timer = setTimeout(() => {
          if (cancelled) return;
          setTyping(false);
          setVisible(0);
          timer = setTimeout(() => step(0), 500);
        }, RESTART_MS);
        return;
      }

      const isReply = SCRIPT[i].direction === "out";
      if (isReply) setTyping(true);

      timer = setTimeout(
        () => {
          if (cancelled) return;
          setTyping(false);
          setVisible(i + 1);
          timer = setTimeout(() => step(i + 1), NEXT_MS);
        },
        isReply ? TYPING_MS : NEXT_MS
      );
    }

    timer = setTimeout(() => step(0), 700);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [visible, typing]);

  return (
    <div
      ref={scrollRef}
      className="flex h-[380px] flex-col gap-2 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {SCRIPT.slice(0, visible).map((m, i) => (
        <div key={i} className="animate-fade-up">
          <ChatBubble direction={m.direction} text={m.text} />
        </div>
      ))}
      {typing && <TypingBubble />}
    </div>
  );
}
