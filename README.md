# Concurseiro+

Plataforma SaaS premium para preparacao de concursos publicos brasileiros.

## Stack

- Next.js 15 App Router, React 19 e TypeScript strict
- Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion e Recharts
- PostgreSQL com Prisma v7 e adapter PG
- Clerk para autenticacao, MFA, Google Login e sessoes
- Anthropic Claude com fallback OpenAI para IA
- Stripe e Mercado Pago para assinaturas
- Upstash Redis para rate limiting
- Sentry, PostHog e Vercel Analytics para observabilidade
- Resend para e-mails transacionais

## Modulos

- Landing page publica com login/cadastro via Clerk
- Dashboard do aluno com desempenho, foco, ranking e historico
- Simulados com banco de provas, cronometro e autosave
- Correcao de redacoes por IA nos padroes ENEM, CESPE, FCC e FGV
- 7 Skills especialistas com chat SSE
- Planner de estudos e Pomodoro
- Ranking, feed social, comentarios, curtidas e moderacao
- Material de estudos com cursos, modulos e aulas
- Assinaturas recorrentes e vitalicias
- Painel admin com KPIs, usuarios, questoes e comentarios
- Auditoria, notificacoes internas, suporte e SEO tecnico

## Desenvolvimento

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Abra `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run type-check
npm run test
npm run test:e2e
npm run build
```

## Deploy

1. Configure PostgreSQL com SSL e connection pooling.
2. Configure variaveis de ambiente na Vercel/Railway.
3. Rode migrations em ambiente controlado.
4. Configure webhooks:
   - Clerk: `/api/webhooks/clerk`
   - Stripe: `/api/webhooks/stripe`
   - Mercado Pago: `/api/webhooks/mercadopago`
5. Configure domínios, PostHog, Sentry e Resend.

Documentos complementares: `Architecture.md`, `API.md`, `Database.md`, `Deployment.md`, `Security.md` e `Runbook.md`.
