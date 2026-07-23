import { AppShell } from "@/components/shared/app-shell";
import { ConcursosTabs } from "@/components/concursos/concursos-tabs";
import { getCurrentDbUser } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";

export default async function ConcursosPage() {
  await getCurrentDbUser();
  const provas = await prisma.prova.findMany({ orderBy: { dataProva: "asc" }, take: 200 });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Concursos</h1>
      <ConcursosTabs provas={provas} />
    </AppShell>
  );
}
