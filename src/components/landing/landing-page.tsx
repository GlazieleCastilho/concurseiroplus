"use client";

import { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { BarChart2, Brain, Calendar, Check, FileText, PenLine, ShieldCheck, Timer, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { billingCycles, equivalentMonthlyPrice, formatCurrency, plans, priceForCycle } from "@/lib/product";
import type { BillingCycle } from "@/generated/prisma";

const steps = [
  ["01", FileText, "Escolha seu concurso", "Acesse simulados organizados por banca, cargo e data. Provas reais, ambiente cronometrado."],
  ["02", Brain, "Estude com IA do seu lado", "As Skills Especialistas respondem duvidas, corrigem questoes e identificam seus pontos fracos."],
  ["03", PenLine, "Corrija sua redacao na hora", "Envie sua redacao e receba nota, criterios, comentarios por trecho e versao melhorada."],
] as const;

const features = [
  [Trophy, "Simulados por Concurso", "Provas por banca, orgao, disciplina, cargo e dificuldade, com cronometro real."],
  [Brain, "7 Skills Especialistas", "Direito, Portugues, Logica, Contabilidade, Informatica, Gestao e Redacao."],
  [PenLine, "Redacao por IA", "Feedback por criterio nos padroes ENEM, CESPE, FCC e FGV."],
  [BarChart2, "Estatisticas Avancadas", "Evolucao por disciplina, banca, periodo, redação e uso das Skills."],
  [Timer, "Pomodoro Integrado", "Foco, pausas, historico e vinculo com tarefas do planner."],
  [Calendar, "Planner de Estudos", "Metas, calendario, recorrencia, lembretes e organizacao semanal."],
] as const;

function billingRedirectUrl(tier?: string, cycle?: BillingCycle): string {
  const params = new URLSearchParams();
  if (tier) params.set("tier", tier);
  if (cycle) params.set("cycle", cycle);
  const query = params.toString();
  return query ? `/billing?${query}` : "/billing";
}

export function LandingPage() {
  const [cycle, setCycle] = useState<BillingCycle>("MENSAL");

  return (
    <main className="grain min-h-screen overflow-hidden">
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border/70 bg-background/78 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="font-display text-xl font-extrabold tracking-tight">
            Concurseiro<span className="text-accent">+</span>
          </a>
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard">
            <Button variant="outline" size="sm">Ja sou assinante</Button>
          </SignInButton>
        </div>
      </nav>

      <section id="top" className="mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-4 pb-16 pt-28 sm:px-6 lg:grid-cols-[1fr_0.86fr]">
        <div>
          <Badge className="mb-6 border-accent/40 bg-accent/10 text-accent">Plataforma premium para concursos publicos</Badge>
          <h1 className="font-display max-w-4xl text-5xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Passe no concurso que voce sempre quis passar.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Simulados reais, correcao de redacao por IA e skills especializadas por disciplina. Tudo em uma plataforma feita para quem leva concurso a serio.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <SignUpButton mode="redirect" forceRedirectUrl="/billing" fallbackRedirectUrl="/billing">
              <Button size="lg" className="shadow-[0_0_32px_rgb(74_144_217/0.24)]">Comecar agora</Button>
            </SignUpButton>
            <a href="#planos">
              <Button size="lg" variant="outline">Ver planos</Button>
            </a>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Acesso imediato apos assinatura. Cancele quando quiser.</p>
          <div className="mt-8 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {["Mais de 500 provas reais cadastradas", "IA nos padroes CESPE, FCC, FGV e ENEM", "7 Skills especialistas por disciplina"].map((item) => (
              <div key={item} className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" /> {item}</div>
            ))}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative">
          <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl" />
          <div className="float-card relative space-y-4 rounded-lg border border-border bg-card/90 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Simulado CESPE</p>
                <h2 className="font-display text-2xl font-bold">Analista Judiciario</h2>
              </div>
              <div className="rounded-md border border-accent/50 px-3 py-2 font-mono text-accent">02:43:19</div>
            </div>
            <div className="rounded-md border border-border bg-background/70 p-4">
              <p className="text-sm text-muted-foreground">Questao 28 de 80</p>
              <p className="mt-2 font-medium">A respeito dos principios da administracao publica, julgue o item a seguir.</p>
              <div className="mt-4 grid gap-2">
                {["Certo", "Errado"].map((item) => <div key={item} className="rounded-md border border-border px-3 py-2 text-sm">{item}</div>)}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-border bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Redacao IA</p>
                <p className="mt-1 text-3xl font-bold text-accent">880</p>
                <p className="text-xs text-muted-foreground">+4 sugestoes por trecho</p>
              </div>
              <div className="rounded-md border border-border bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">Skill Juridica</p>
                <p className="mt-1 text-sm">&quot;A banca costuma inverter legalidade com finalidade neste tema.&quot;</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Da prova ao aprovado em 3 passos</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(([number, Icon, title, description]) => (
            <Card key={title}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Icon className="h-6 w-6 text-accent" />
                  <span className="font-display text-5xl font-extrabold text-accent/20">{number}</span>
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">Tudo que voce precisa para passar</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, description]) => (
            <Card key={title} className="transition hover:border-accent hover:shadow-[0_0_28px_rgb(74_144_217/0.14)]">
              <CardHeader>
                <Icon className="h-6 w-6 text-accent" />
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{description}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="planos" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Escolha seu plano</h2>
            <p className="mt-2 text-muted-foreground">Sem plano gratuito. Aprovacao exige compromisso.</p>
          </div>
          <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-card p-1">
            {billingCycles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCycle(item)}
                className={`rounded-md px-3 py-2 text-sm transition ${cycle === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item === "MENSAL" ? "Mensal" : item === "TRIMESTRAL" ? "Trimestral" : item === "ANUAL" ? "Anual" : "Vitalicio"}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.tier} className={plan.popular ? "scale-[1.01] border-accent shadow-[0_0_34px_rgb(74_144_217/0.18)]" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="font-display text-2xl">{plan.name}</CardTitle>
                  {plan.popular && <Badge>Mais popular</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="pt-4">
                  <span className="font-display text-4xl font-extrabold">{formatCurrency(equivalentMonthlyPrice(plan, cycle))}</span>
                  {cycle !== "VITALICIO" && <span className="text-muted-foreground">/mes</span>}
                  {cycle !== "MENSAL" && <p className="mt-1 text-sm text-muted-foreground">Total: {formatCurrency(priceForCycle(plan, cycle))}</p>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2 text-sm"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" /> {feature}</li>
                  ))}
                </ul>
                <SignUpButton mode="redirect" forceRedirectUrl={billingRedirectUrl(plan.tier, cycle)} fallbackRedirectUrl={billingRedirectUrl(plan.tier, cycle)}>
                  <Button className="mt-6 w-full" variant={plan.popular ? "default" : "outline"}>Assinar {plan.name}</Button>
                </SignUpButton>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
