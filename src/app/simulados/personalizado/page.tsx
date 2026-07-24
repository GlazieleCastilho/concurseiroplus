import Link from "next/link";
import { AppShell } from "@/components/shared/app-shell";
import { getCurrentDbUser } from "@/lib/clerk";
import { getQuestionFilterOptions } from "@/repositories/catalog-repository";
import { CustomSimuladoForm } from "@/components/simulados/custom-simulado-form";

export default async function SimuladoPersonalizadoPage() {
  await getCurrentDbUser();
  const options = await getQuestionFilterOptions();

  return (
    <AppShell>
      <div>
        <Link href="/simulados" className="text-sm text-muted-foreground hover:underline">← Simulados</Link>
        <h1 className="font-display text-3xl font-bold">Simulado personalizado</h1>
        <p className="text-sm text-muted-foreground">Escolha disciplinas, bancas e anos especificos, ou deixe em branco para um simulado misturado.</p>
      </div>
      <CustomSimuladoForm disciplinas={options.disciplinas} bancas={options.bancas} anos={options.anos} />
    </AppShell>
  );
}
