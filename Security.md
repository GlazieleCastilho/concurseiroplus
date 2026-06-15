# Security

Controles implementados:

- Clerk para autenticacao, MFA, recuperacao de senha, Google Login e sessao.
- RBAC: `user`, `admin`, `super_admin`.
- Middleware protege rotas privadas e admin.
- Headers: CSP, HSTS em producao, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy e X-XSS-Protection.
- Rate limit em login, IA, redacoes, skills e APIs publicas via Upstash Redis.
- Zod em todas as entradas criticas.
- Audit logs com usuario, acao, entidade, IP e user agent.
- Webhooks verificados por assinatura quando o provedor disponibiliza segredo.

Checklist pre-producao:

- `npm audit --omit=dev`
- `npm run type-check`
- `npm run test`
- `npm run build`
- Revisar CSP para domínios finais.
- Ativar MFA no Clerk.
