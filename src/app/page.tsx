import Link from "next/link";
import { Wallet, Receipt, CalendarClock, Landmark, Sparkles, MessageCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { PhoneMockup } from "@/components/marketing/PhoneMockup";
import { AutoChat } from "@/components/marketing/AutoChat";
import { PricingToggle } from "@/components/marketing/PricingToggle";
import { ExpenseFeedCard } from "@/components/marketing/ExpenseFeedCard";
import { CommandTicker } from "@/components/marketing/CommandTicker";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

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

// Pequena variação de cor nos ícones de funcionalidade — mesma família azul,
// só pra não ficar tudo idêntico numa seção com mais destaque.
const FEATURE_TINTS = [
  "bg-lilac/15 text-lilac",
  "bg-sky-400/15 text-sky-400",
  "bg-indigo-400/15 text-indigo-400",
  "bg-cyan-400/15 text-cyan-400",
  "bg-blue-400/15 text-blue-400",
  "bg-lilac/15 text-lilac",
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
    <div className="relative min-h-screen overflow-x-hidden bg-bg">
      {/* Respiro visual bem discreto atrás do hero — nada além disso */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-[radial-gradient(ellipse_at_top,_rgba(47,111,237,0.07),_transparent_65%)]" />

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
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-success" />
              </span>
              Feito para casais que dividem a vida
            </span>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-text sm:text-5xl">
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
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-faint lg:justify-start">
              <ShieldCheck className="h-3.5 w-3.5 text-lilac" />
              14 dias de garantia · sem burocracia para começar
            </p>
          </div>

          <div className="relative">
            <div className="glow-orb left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-lilac/25 to-marsala/25" />
            <PhoneMockup>
              <AutoChat />
            </PhoneMockup>
          </div>
        </div>
      </section>

      {/* Se você sabe mandar mensagem no WhatsApp... */}
      <section className="overflow-hidden py-16">
        <Reveal className="mx-auto mb-10 max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-display text-2xl font-semibold leading-tight text-text sm:text-3xl">
            Se você sabe mandar uma mensagem no WhatsApp,
            <br className="hidden sm:block" /> já sabe usar a Aura.
          </h2>
          <p className="mt-3 text-text-muted">
            Fala com a Aura do mesmo jeito que fala com qualquer pessoa. Peça com as palavras que vierem à cabeça —
            ela entende.
          </p>
        </Reveal>
        <CommandTicker />
      </section>

      {/* Gastos do cartão, ao vivo — faixa escura, pra dar ritmo à página */}
      <section className="section-dark relative overflow-hidden py-20">
        <div className="glow-orb -left-24 top-10 h-[380px] w-[380px] bg-lilac/25" />
        <div className="glow-orb -right-24 bottom-0 h-[420px] w-[420px] bg-marsala/20" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal className="order-2 lg:order-1">
              <ExpenseFeedCard />
            </Reveal>
            <Reveal delay={120} className="order-1 text-center lg:order-2 lg:text-left">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface px-3.5 py-1.5 text-xs font-medium text-text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-lilac" />
                Direto do cartão, sem digitar nada
              </span>
              <h2 className="font-display text-3xl font-semibold leading-tight text-text sm:text-4xl">
                Saiba exatamente pra onde vai o dinheiro do casal.
              </h2>
              <p className="mx-auto mt-4 max-w-md text-text-muted lg:mx-0">
                Cada compra do cartão entra sozinha na fatura, já organizada por categoria e por quem gastou —
                a Aura mantém tudo atualizado em tempo real, sem vocês precisarem digitar nada.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Reveal className="card-glass relative grid gap-8 divide-y divide-border p-8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:p-10">
          {STATS.map((s) => (
            <div key={s.desc} className="pt-6 text-center first:pt-0 sm:px-6 sm:pt-0 sm:text-left sm:first:pl-0">
              <p className="font-display text-4xl font-semibold text-gradient-aura sm:text-5xl">{s.value}</p>
              <p className="mt-2 text-sm text-text-muted">{s.desc}</p>
            </div>
          ))}
        </Reveal>
        <p className="mt-4 text-center text-xs text-text-faint">
          Fonte: pesquisa Serasa em parceria com o Instituto Opinion Box, com 1.120 brasileiros de todas as regiões.
        </p>
      </section>

      {/* Como funciona */}
      <section id="como-funciona" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="mb-12 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Do zero ao organizado em 3 passos</h2>
          <p className="mt-2 text-text-muted">Sem planilha. Sem app novo pra aprender a usar.</p>
        </Reveal>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="card-glass card-glass-hover p-6">
                <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-lilac to-marsala font-display text-sm font-semibold text-white">
                  {s.n}
                </span>
                <h3 className="mb-1 font-display text-base font-semibold text-text">{s.title}</h3>
                <p className="text-sm text-text-muted">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Funcionalidades — segunda faixa escura, alternando o ritmo da página */}
      <section id="funcionalidades" className="section-dark relative overflow-hidden py-20">
        <div className="glow-orb left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 bg-lilac/15" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="mb-12 text-center">
            <h2 className="font-display text-3xl font-semibold text-text">Tudo o que um casal precisa. Só isso.</h2>
            <p className="mt-2 text-text-muted">Nada de funcionalidade a mais pra confundir.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) * 90}>
                  <div className="card-glass card-glass-hover p-6">
                    <span
                      className={cn(
                        "mb-4 flex h-10 w-10 items-center justify-center rounded-xl",
                        FEATURE_TINTS[i % FEATURE_TINTS.length]
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mb-1.5 font-display text-base font-semibold text-text">{f.title}</h3>
                    <p className="text-sm text-text-muted">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Preço */}
      <section id="preco" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal className="mb-10 text-center">
          <h2 className="font-display text-3xl font-semibold text-text">Sozinho(a) ou a dois. Tudo incluso.</h2>
          <p className="mt-2 text-text-muted">Sem limite de lançamentos, sem letra miúda.</p>
        </Reveal>
        <Reveal delay={120}>
          <PricingToggle />
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-border">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lilac/50 to-transparent" />
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
