import type { BillingCycle, PlanTier, SkillSlug } from "@/generated/prisma";

export const planTiers = ["ESSENCIAL", "PRO", "ELITE"] as const;
export const billingCycles = ["MENSAL", "TRIMESTRAL", "ANUAL", "VITALICIO"] as const;

export type PlanDefinition = {
  tier: PlanTier;
  name: string;
  tagline: string;
  monthlyPriceCents: number;
  lifetimePriceCents: number;
  popular?: boolean;
  features: string[];
  limits: {
    essaysPerMonth: number | null;
    discursivePerMonth: number | null;
    skills: number | null;
    essayPatterns: string[];
    statisticsDays: number | null;
    supportSlaHours: number;
  };
};

export const plans: PlanDefinition[] = [
  {
    tier: "ESSENCIAL",
    name: "Essencial",
    tagline: "Acesso completo ao basico",
    monthlyPriceCents: 2990,
    lifetimePriceCents: 49700,
    features: [
      "Simulados objetivos ilimitados",
      "5 questoes dissertativas por mes",
      "2 Skills Especialistas a escolha",
      "3 correcoes de redacao ENEM por mes",
      "Planner basico",
      "Estatisticas dos ultimos 30 dias",
      "Suporte por e-mail em ate 72h",
    ],
    limits: {
      essaysPerMonth: 3,
      discursivePerMonth: 5,
      skills: 2,
      essayPatterns: ["ENEM"],
      statisticsDays: 30,
      supportSlaHours: 72,
    },
  },
  {
    tier: "PRO",
    name: "Pro",
    tagline: "Para o concurseiro serio",
    monthlyPriceCents: 5990,
    lifetimePriceCents: 99700,
    popular: true,
    features: [
      "Simulados objetivos e dissertativos ilimitados",
      "20 questoes dissertativas por mes",
      "Todas as 7 Skills Especialistas",
      "20 correcoes de redacao ENEM e CESPE por mes",
      "Planner completo",
      "Historico total de estatisticas",
      "Suporte por e-mail em ate 24h",
    ],
    limits: {
      essaysPerMonth: 20,
      discursivePerMonth: 20,
      skills: null,
      essayPatterns: ["ENEM", "CESPE"],
      statisticsDays: null,
      supportSlaHours: 24,
    },
  },
  {
    tier: "ELITE",
    name: "Elite",
    tagline: "Preparacao maxima",
    monthlyPriceCents: 9990,
    lifetimePriceCents: 169700,
    features: [
      "Tudo do Pro",
      "Questoes dissertativas ilimitadas",
      "Correcoes de redacao ilimitadas em todos os padroes",
      "Respostas prioritarias das Skills",
      "Acesso antecipado a novos conteudos",
      "Badge Elite no ranking",
      "Suporte prioritario em ate 4h",
    ],
    limits: {
      essaysPerMonth: null,
      discursivePerMonth: null,
      skills: null,
      essayPatterns: ["ENEM", "CESPE", "FCC", "FGV"],
      statisticsDays: null,
      supportSlaHours: 4,
    },
  },
];

export function priceForCycle(plan: PlanDefinition, cycle: BillingCycle): number {
  if (cycle === "VITALICIO") return plan.lifetimePriceCents;
  if (cycle === "TRIMESTRAL") return Math.round(plan.monthlyPriceCents * 3 * 0.85);
  if (cycle === "ANUAL") return Math.round(plan.monthlyPriceCents * 12 * 0.65);
  return plan.monthlyPriceCents;
}

export function equivalentMonthlyPrice(plan: PlanDefinition, cycle: BillingCycle): number {
  const total = priceForCycle(plan, cycle);
  if (cycle === "TRIMESTRAL") return Math.round(total / 3);
  if (cycle === "ANUAL") return Math.round(total / 12);
  return total;
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export type SkillDefinition = {
  slug: SkillSlug;
  name: string;
  discipline: string;
  description: string;
  topics: string[];
  banks: string[];
  systemPrompt: string;
};

export const skills: SkillDefinition[] = [
  {
    slug: "juridica",
    name: "Skill Juridica",
    discipline: "Direito",
    description: "Constitucional, Administrativo, Civil e Penal com foco em concursos.",
    topics: ["CF/88", "atos administrativos", "contratos", "improbidade", "crimes contra a administracao"],
    banks: ["CESPE", "FCC", "VUNESP", "FGV"],
    systemPrompt: "Voce e uma professora especialista em Direito para concursos publicos brasileiros. Responda com precisao, cite fundamentos legais quando cabivel, destaque pegadinhas de banca e proponha revisao objetiva.",
  },
  {
    slug: "gestao",
    name: "Skill Gestao",
    discipline: "Administracao Publica",
    description: "Gestao de pessoas, administracao publica, orcamento e Lei 8.112.",
    topics: ["teorias da administracao", "gestao por competencias", "orcamento publico", "Lei 8.112"],
    banks: ["CESPE", "FCC", "ESAF", "FGV"],
    systemPrompt: "Voce e especialista em Administracao Publica e Gestao de Pessoas para concursos. Explique conceitos, compare autores e conecte a teoria ao estilo de cobranca das bancas.",
  },
  {
    slug: "linguagem",
    name: "Skill Linguagem",
    discipline: "Lingua Portuguesa",
    description: "Gramatica, interpretacao, coesao, coerencia e ortografia.",
    topics: ["sintaxe", "morfologia", "coesao", "coerencia", "interpretacao"],
    banks: ["CESPE", "FCC", "FGV", "VUNESP"],
    systemPrompt: "Voce e especialista em Lingua Portuguesa para concursos. Analise enunciados, mostre regras gramaticais, explique alternativas e seja rigorosa com norma culta.",
  },
  {
    slug: "redacao",
    name: "Skill Redacao",
    discipline: "Producao Textual",
    description: "Estrutura argumentativa, proposta de intervencao e adequacao a banca.",
    topics: ["introducao", "desenvolvimento", "conclusao", "argumentacao", "proposta de intervencao"],
    banks: ["ENEM", "CESPE", "FCC", "FGV"],
    systemPrompt: "Voce e uma corretora de redacoes para concursos. Oriente reescrita, estrutura, repertorio, criterios de banca e melhoria de trechos com feedback acionavel.",
  },
  {
    slug: "digital",
    name: "Skill Digital",
    discipline: "Informatica e TI",
    description: "Office, sistemas operacionais, redes, seguranca, LGPD e cloud.",
    topics: ["Office", "Windows", "Linux", "redes", "seguranca da informacao", "LGPD"],
    banks: ["CESPE", "FCC", "FGV", "IBFC"],
    systemPrompt: "Voce e especialista em Informatica para concursos. Explique conceitos tecnicos de forma didatica, objetiva e alinhada a questoes de banca.",
  },
  {
    slug: "logica",
    name: "Skill Logica",
    discipline: "Raciocinio Logico",
    description: "Logica proposicional, conjuntos, porcentagem, sequencias e graficos.",
    topics: ["proposicoes", "conjuntos", "probabilidade", "porcentagem", "juros", "sequencias"],
    banks: ["CESPE", "FCC", "FGV", "VUNESP"],
    systemPrompt: "Voce e especialista em Raciocinio Logico e Matematica para concursos. Resolva passo a passo, evidencie atalhos e alerte para armadilhas.",
  },
  {
    slug: "contabil",
    name: "Skill Contabil",
    discipline: "Contabilidade",
    description: "Contabilidade geral, publica, demonstrativos, SIAFI e orcamento.",
    topics: ["balancetes", "DRE", "ativo e passivo", "contabilidade publica", "SIAFI"],
    banks: ["ESAF", "STN", "TCU", "CGU", "Receita Federal"],
    systemPrompt: "Voce e especialista em Contabilidade Geral e Publica para concursos. Use raciocinio contabil, exemplos numericos e linguagem objetiva.",
  },
];

export function getAllowedSkillsByPlan(tier: PlanTier): SkillSlug[] {
  if (tier === "ESSENCIAL") return ["juridica", "linguagem"];
  return skills.map((skill) => skill.slug);
}
