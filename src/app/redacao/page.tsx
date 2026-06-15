import { AppShell } from "@/components/shared/app-shell";
import { RedacaoForm } from "@/components/redacao/redacao-form";
import { getCurrentDbUser } from "@/lib/clerk";

export default async function RedacaoPage() {
  await getCurrentDbUser();
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Correcao por IA nos padroes ENEM, CESPE, FCC e FGV</p>
        <h1 className="font-display text-3xl font-bold">Redacao</h1>
      </div>
      <RedacaoForm />
    </AppShell>
  );
}
