import { AppShell } from "@/components/shared/app-shell";
import { ConcursosTabs } from "@/components/concursos/concursos-tabs";
import { getCurrentDbUser } from "@/lib/clerk";
import { listConcursosPublicos } from "@/repositories/concursos-repository";

export default async function ConcursosPage() {
  await getCurrentDbUser();
  const concursos = await listConcursosPublicos();
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Concursos</h1>
      <ConcursosTabs concursos={concursos} />
    </AppShell>
  );
}
