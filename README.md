# Aura — MVP

SaaS de gestão financeira para casais. O casal organiza a vida financeira junto
e a Aura ajuda pelo WhatsApp.

## Stack

Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Prisma · SQLite (dev) / PostgreSQL (produção)

## Rodando localmente

```bash
npm install
npx prisma migrate dev   # cria o banco SQLite local e roda as migrações
npm run db:seed          # popula um casal de demonstração
npm run dev              # sobe em http://localhost:3100
```

Login de demonstração: `ana@aura.app` / `123456` (ou `paulo@aura.app` / `123456`).

## Estrutura

- `src/app` — páginas (App Router). `/` é a landing pública; `/app/*` é o
  produto autenticado (dashboard, gastos, contas fixas, dívidas, sonhos,
  Aura WhatsApp, configurações).
- `src/actions` — Server Actions (auth, casal, gastos, contas fixas, dívidas,
  sonhos, configurações, WhatsApp).
- `src/lib` — lógica de domínio: `auth.ts` (sessão/senha), `calc.ts` (parcelas,
  dívidas, metas), `finance.ts` (consolidação financeira do casal), `aura/`
  (parser de mensagens, motor de resposta, cliente de WhatsApp).
- `prisma/schema.prisma` — modelo de dados.

## Aura no WhatsApp — hoje é uma simulação real, não uma maquete

Não existe um chat da Aura dentro do app. A tela **Aura WhatsApp** simula o
que aconteceria no WhatsApp de verdade: as mensagens passam por
`src/lib/aura/parseMessage.ts` (hoje um parser por regras/palavras-chave) e
`src/lib/aura/engine.ts`, que grava e consulta **as mesmas tabelas** usadas
pelo resto do app. Um gasto lançado pelo simulador aparece imediatamente em
Gastos e no Dashboard.

Para conectar de verdade:

1. **WhatsApp**: implemente `src/lib/aura/whatsapp-client.ts` para chamar a
   WhatsApp Business Cloud API (Meta) ou Twilio, usando
   `WHATSAPP_API_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` (já previstas em
   `.env.example`). A rota `src/app/api/whatsapp/webhook/route.ts` já está no
   formato esperado para receber mensagens reais — hoje ela só é chamada
   pelo simulador via Server Action.
2. **IA**: troque a implementação de `parseAuraMessage` (em
   `src/lib/aura/parseMessage.ts`) por uma chamada a um modelo de linguagem.
   A assinatura da função (`texto -> intenção`) não muda, então nada mais no
   sistema precisa ser alterado.

## Trocando para PostgreSQL em produção

Em `prisma/schema.prisma`, troque:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

por:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

e aponte `DATABASE_URL` para o Postgres real (Neon, Supabase, RDS...). O
schema não usa nenhum recurso exclusivo do SQLite.
