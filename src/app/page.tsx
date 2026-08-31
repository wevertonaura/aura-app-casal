import Link from "next/link";
import { Wallet, Receipt, CalendarClock, Landmark, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { ChatBubble } from "@/components/whatsapp/ChatBubble";
import { PricingToggle } from "@/components/marketing/PricingToggle";

const FEATURES = [
  {
    icon: Wallet,
    title: "Dashboard",
    desc: "Renda do casal, gastos, dívidas e sonhos num painel só — com a Aura te avisando se o mês está apertado.",
  },
  {
    icon: Receipt,
    title: "Gastos",
    desc: "Cadastrem o dia a dia por categoria e pessoa. Cada centavo com dono e com lugar.",
  },
  {
    icon: CalendarClock,
    title: "Contas fixas",
    desc: "Aluguel, internet, academia e parcelas — a Aura controla sozinha quantas parcelas faltam.",
  },
  {
    icon: Landmark,
    title: "Dívidas",
    desc: "Registrem o total e o quanto pretendem pagar por mês. A Aura estima quando vão quitar.",
  },
  {
    icon: Sparkles,
    title: "Sonhos",
    desc: "Uma viagem, um carro, uma reforma — a Aura calcula quanto guardar por mês para chegar lá.",
  },
  {
    icon: MessageCircle,
    title: "Aura no WhatsApp",
    desc: 'Sem app pra abrir. Só mandar mensagem: "gastei R$ 80 no mercado" e pronto, já está registrado.',
  },
];

const STATS = [
  { value: "53%", desc: "dos brasileiros dizem que dinheiro é o principal motivo de briga no relacionamento" },
  { value: "45%", desc: "já ficaram com dívida por causa de um parceiro(a)" },
  { value: "4 em 10", desc: "já ficaram com o nome sujo por causa de um relacionamento" },
];

const STEPS = [
  {
    n: "1",
    title: "Criem o casal",
    desc: "Cada um entra com sua renda. A Aura já mostra a renda conjunta de vocês.",
  },
  {
    n: "2",
    title: "Conectem o WhatsApp",
    desc: "Leva menos de um minuto. Depois disso, é só conversar normalmente.",
  },
  {
    n: "3",
    title: "A Aura cuida do resto",
    desc: "Gastos, contas, dívidas e sonhos organizados sozinhos, sempre atualizados no painel.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-x-hidden bg-bg">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.14),_transparent_60%)]" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border bg-bg/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-lilac to-marsala" />
            <span className="font-display text-lg font-semibold text-gradient-aura">Aura</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm text-text-muted sm:flex">
            <a href="#como-funciona" className="hover:text-text">Como funciona</a>
            <a href="#funcionalidades" className="hover:text-text">Funcionalidades</a>
            <a href="#preco" className="hover:text-text">Preço</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-text-muted hover:text-text sm:block">
              Entrar
            </Link>
            <LinkButton href="/signup" size="sm">
              Começar agora
            </LinkButton>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="animate-fade-up text-center lg:text-left">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Feito para casais que dividem a vida
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight text-text sm:text-5xl">
              Vocês administram a vida a dois.
              <br />
              <span className="text-gradient-aura">A Aura organiza as finanças.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base text-text-muted lg:mx-0">
              Gastos, contas fixas, dívidas e sonhos, tudo num só lugar — e vocês falam com a Aura
              como falam com uma pessoa, direto no WhatsApp.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <LinkButton href="/signup" size="lg">
                Começar grátis <ArrowRight className="h-4 w-4" />
              </LinkButton>
              <LinkButton href="#como-funciona" variant="secondary" size="lg">
                Ver como funciona
              </LinkButton>
            </div>
            <p className="mt-4 text-xs text-text-faint">14 dias de garantia · sem burocracia para começar</p>
          </div>

          <div className="animate-float">
            <PhoneMockup>
              <ChatBubble direction="in" text="Aura, gastei R$ 80 no mercado." />
              <ChatBubble direction="out" text="✅ Registrei R$ 80,00 em Alimentação (mercado)." />
              <ChatBubble direction="in" text="Comprei um celular em 10x de R$ 350." />
              <ChatBubble direction="out" text="✅ Anotei: celular em 10x de R$ 350,00. Já está em Contas Fixas." />
              <ChatBubble direction="in" text="Quanto ainda posso gastar esse mês?" />
              <ChatBubble direction="out" text="💰 Vocês ainda podem gastar R$ 1.240,00 este mês." />
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="card-glass grid gap-8 p-8 sm:grid-cols-3 sm:p-10">
          {STATS.map((s) => (
            <div key={s.desc} className="text-center sm:text-left">
              <p className="font-display text-4xl font-semibold text-gradient-aura">{s.value}</p>
              <p className="mt-2 text-sm text-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-text-faint">
          Fonte: pesquisa Serasa em parceria com o Instituto Opinion Box, com 1.120 brasileiros de todas as regiões.
        </p>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Do zero ao organizado em 3 passos</h2>
          <p className="mt-2 text-text-muted">Sem planilha. Sem app novo pra aprender a usar.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card-glass p-6">
              <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-marsala font-display text-sm font-semibold text-white">
                {s.n}
              </span>
              <h3 className="mb-1 font-display text-base font-semibold text-text">{s.title}</h3>
              <p className="text-sm text-text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Funcionalidades */}
      <section id="funcionalidades" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Tudo o que um casal precisa. Só isso.</h2>
          <p className="mt-2 text-text-muted">Nada de funcionalidade a mais pra confundir.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="card-glass p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-lilac/10 text-lilac">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mb-1.5 font-display text-base font-semibold text-text">{f.title}</h3>
                <p className="text-sm text-text-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Preço */}
      <section id="preco" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Um plano. Tudo incluso.</h2>
          <p className="mt-2 text-text-muted">Sem limite de lançamentos, sem letra miúda.</p>
        </div>
        <PricingToggle />
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-text-faint sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-gradient-to-br from-lilac to-marsala" />
            <span className="font-display font-semibold text-text-muted">Aura</span>
          </div>
          <p>Feito para casais que organizam a vida financeira juntos.</p>
        </div>
      </footer>
    </div>
  );
}
