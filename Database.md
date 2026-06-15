# Database

Banco principal: PostgreSQL via Prisma v7.

Entidades principais:

- Users, Plans, Subscriptions, Payments, Invoices
- Provas, Questoes, Alternativas, Simulados, Respostas, Resultados
- Redacoes, RedacaoFeedback
- Skills, SkillChats, SkillMessages
- PlannerTasks, PomodoroSessions, StudyStatistics
- Notifications, Posts, Comments, Likes, Ranking
- Courses, Modules, Lessons
- SupportTickets, AuditLogs

Indices foram definidos para:

- Sincronizacao Clerk por `clerkUserId`
- Listagens por usuario, status e datas
- Provas por banca/orgao/cargo/data
- Historico de redacoes e chats por usuario
- Ranking por periodo/posicao

Use `npx prisma migrate dev` em desenvolvimento e `npx prisma migrate deploy` em producao.
