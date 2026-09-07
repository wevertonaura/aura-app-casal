import { Check } from "lucide-react";

type Msg = { text: string; time: string };

const ROW_1: Msg[] = [
  { text: "Aura, gastei R$ 80 no mercado.", time: "08:41" },
  { text: "Quanto ainda posso gastar esse mês?", time: "13:47" },
  { text: "Comprei um celular em 10x de R$ 350.", time: "21:04" },
  { text: "Quanto a gente tem de dívida?", time: "09:09" },
  { text: "Registra a conta de luz, R$ 210.", time: "18:09" },
  { text: "Quanto falta pra viagem de dezembro?", time: "16:42" },
];

const ROW_2: Msg[] = [
  { text: "gastei 45 no uber", time: "19:14" },
  { text: "quanto sobrou de lazer esse mês?", time: "19:58" },
  { text: "paga a academia todo dia 5", time: "15:44" },
  { text: "quanto o Paulo já gastou esse mês?", time: "12:44" },
  { text: "anota 1.200 de aluguel", time: "09:44" },
  { text: "cria uma meta de R$ 5.000 pra reforma", time: "07:22" },
];

const ROW_3: Msg[] = [
  { text: "paguei 90 na farmácia no débito", time: "11:19" },
  { text: "quanto falta pra quitar o cartão?", time: "07:38" },
  { text: "lembra de pagar o INSS dia 20", time: "11:28" },
  { text: "gastei 32 no ifood", time: "20:15" },
  { text: "quanto dá pra guardar por mês pro carro?", time: "10:02" },
  { text: "cadastra a internet, 120 por mês", time: "14:51" },
];

function Row({ messages, reverse }: { messages: Msg[]; reverse?: boolean }) {
  const doubled = [...messages, ...messages];
  return (
    <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className={reverse ? "animate-marquee-horizontal-reverse flex shrink-0 gap-3 pr-3" : "animate-marquee-horizontal flex shrink-0 gap-3 pr-3"}>
        {doubled.map((m, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-2xl border border-lilac/20 bg-lilac/10 px-4 py-2.5 text-sm text-text"
          >
            {m.text}
            <span className="flex items-center gap-0.5 text-[10px] text-text-faint">
              {m.time}
              <Check className="h-3 w-3 text-lilac" />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function CommandTicker() {
  return (
    <div className="flex flex-col gap-3">
      <Row messages={ROW_1} />
      <Row messages={ROW_2} reverse />
      <Row messages={ROW_3} />
    </div>
  );
}
