import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { SimuladoRunner } from "@/components/simulados/simulado-runner";

export default async function SimuladoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentDbUser();
  const simulado = await prisma.simulado.findFirst({
    where: { id, userId: user.id },
    include: {
      prova: { include: { questoes: { include: { alternativas: true, textoApoio: true }, orderBy: { numero: "asc" } } } },
      respostas: { select: { questaoId: true, respostaDada: true } },
    },
  });
  if (!simulado || !simulado.prova) notFound();

  const initialAnswers = Object.fromEntries(
    simulado.respostas.filter((resposta) => resposta.respostaDada).map((resposta) => [resposta.questaoId, resposta.respostaDada as string])
  );

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">{simulado.prova.banca} · {simulado.prova.orgao}</p>
        <h1 className="font-display text-3xl font-bold">{simulado.titulo}</h1>
      </div>
      <SimuladoRunner
        simuladoId={simulado.id}
        expiradoEm={(simulado.expiradoEm ?? new Date()).toISOString()}
        questoes={simulado.prova.questoes}
        initialAnswers={initialAnswers}
        finalizado={simulado.status === "FINALIZADO"}
      />
    </AppShell>
  );
}
