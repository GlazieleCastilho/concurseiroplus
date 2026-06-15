Concurseiro+ é uma plataforma digital focada exclusivamente na realização de simulados para concursos públicos, permitindo que estudantes treinem de forma personalizada, acompanhem seu desempenho, identifiquem pontos de melhoria com base em dados reais, faça seu  próprio cronograma e interaja com outros concurseiros através do feed.

 Visão geral
  Principais recursos
  - Simulados personalizados
  - Correção automática
  - Estatísticas de desempenho
  - Histórico detalhado
  - Painel administrativo para gestão de questões e usuários

 Objetivo da plataforma

 - Ajudar concurseiros a praticar com eficiência
 - Simular o ambiente real de provas
 - Oferecer feedback imediato e dados claros
 - Facilitar a criação e manutenção de questões por professores

 Perfis de usuário

 **Aluno**
 - Realiza simulados
 - Acompanha desempenho
 - Visualiza estatísticas e histórico
 - Gerencia seu perfil

 **Administrador (Professor)**
 - Gerencia questões
 - Gerencia usuários
 - Acompanha métricas da plataforma
 - Visualiza relatórios

 Arquitetura
 
 Frontend
 - Next.js
 - Tailwind CSS
 - Componentes reutilizáveis
 - Totalmente responsivo

 Backend
 - Firebase ou Supabase
 - Autenticação por e-mail e senha
 - Banco de dados relacional ou NoSQL
 - API Routes (Next.js)

 Autenticação e segurança

 Autenticação
 - Login com e-mail e senha
 - Cadastro com nome, e-mail e senha
 - Recuperação de senha via e-mail
 - Login com Google (planejado)

 Controle de acesso
 - Sistema de roles: `user` (aluno) e `admin`
 - Proteção de rotas privadas
 - Rotas `/admin/*` acessíveis apenas por administradores

 Segurança
 - Rate limit em simulados e feedbacks
 - Validação de dados no frontend e backend
 - Middleware de proteção de rotas

 Rotas e funcionalidades

 Área do aluno

| Rota | Funcionalidade |
| --- | --- |
| `/login` | Login com e-mail e senha, links para cadastro e recuperação |
| `/register` | Cadastro com nome, e-mail, senha e confirmação |
| `/dashboard` | Boas-vindas, atalhos, estatísticas rápidas e simulados recentes |
| `/simulado` | Criar simulado (tipo, número de questões e tempo) |
| `/simulado/executar` | Execução do simulado com timer, progresso e respostas |
| `/resultado/[id]` | Resultado com pontuação, acertos/erros e revisão |
| `/historico` | Histórico com filtros por matéria, banca e período |
| `/estatisticas` | Gráficos de desempenho e evolução temporal |
| `/perfil` | Gerenciamento de perfil e segurança da conta |

 Área administrativa

| Rota | Funcionalidade |
| --- | --- |
| `/admin/dashboard` | Métricas gerais e atividades recentes |
| `/admin/questoes` | Listagem e filtros de questões |
| `/admin/questoes/nova` | Criação/edição de questões |
| `/admin/usuarios` | Gestão de usuários e permissões |
| `/admin/relatorios` | Relatórios e exportação em CSV |
| `/admin/feedbacks` | Gestão de feedbacks enviados |

 Telas de suporte e sistema

 - 403 (Acesso negado)
 - 404 (Página não encontrada)
 - Tela de carregamento
 - Modais de confirmação
 - Tela de manutenção (opcional)

 Responsividade e acessibilidade

 - Design mobile-first
 - Suporte a teclado
 - ARIA labels
 - Alto contraste
 - Leitura confortável para textos longos

 Roadmap

- Dark Mode
- Modo leitura noturna
- Simulados por tema
- Questões dissertativas com correção manual
- Planos premium
- Integração com gateway de pagamento
 
  Getting Started
 
 First, run the development server:
 
 ```bash
 npm run dev
 # or
 yarn dev
 # or
 pnpm dev
 # or
 bun dev
 ```
 
 Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
 
 You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.
 
 This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
 
 ## Learn More
 
 To learn more about Next.js, take a look at the following resources:
 
 
EOF
)
