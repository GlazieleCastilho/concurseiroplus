import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/clerk";
import { getRanking } from "@/repositories/catalog-repository";

export default async function RankingPage() {
  await getCurrentDbUser();
  const ranking = await getRanking();
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Ranking</h1>
      <Card>
        <CardHeader><CardTitle>Classificacao global</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {ranking.map((item) => (
            <div key={item.id} className="grid grid-cols-[60px_1fr_120px] rounded-md border border-border p-3 text-sm">
              <strong>#{item.position}</strong>
              <span>{item.user.firstName}</span>
              <span className="text-right text-muted-foreground">{item.score} pts</span>
            </div>
          ))}
          {ranking.length === 0 && <p className="text-sm text-muted-foreground">Ranking sera calculado apos atividades dos alunos.</p>}
        </CardContent>
      </Card>
    </AppShell>
  );
}
