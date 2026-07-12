import Link from "next/link";
import { Brain } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/clerk";
import { getAllowedSkillsByPlan, skills } from "@/lib/product";

export default async function SkillsPage() {
  const user = await getCurrentDbUser();
  const allowed = getAllowedSkillsByPlan(user.planTier);
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Agentes especialistas por disciplina</p>
        <h1 className="font-display text-3xl font-bold">Skills</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {skills.map((skill) => {
          const locked = !allowed.includes(skill.slug);
          return (
            <Card key={skill.slug} className={locked ? "opacity-70" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <Brain className="h-6 w-6 text-accent" />
                  {locked ? <Badge variant="outline">Upgrade</Badge> : <Badge>Disponivel</Badge>}
                </div>
                <CardTitle>{skill.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{skill.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {skill.banks.map((bank) => <Badge key={bank} variant="outline">{bank}</Badge>)}
                </div>
                <Button asChild className="mt-5 w-full" variant={locked ? "outline" : "default"}>
                  <Link href={locked ? "/billing" : `/skills/${skill.slug}`}>{locked ? "Fazer upgrade" : "Abrir chat"}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
