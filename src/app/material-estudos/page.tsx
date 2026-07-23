import Link from "next/link";
import { Lock } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser, hasPlanAccess } from "@/lib/clerk";
import { getCourses } from "@/repositories/catalog-repository";

export default async function MaterialEstudosPage() {
  const user = await getCurrentDbUser();
  const courses = await getCourses();
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Material de estudos</h1>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const unlocked = hasPlanAccess(user.planTier, course.requiredTier);
          return (
            <Link key={course.id} href={`/material-estudos/${course.slug}`}>
              <Card className="h-full transition-colors hover:border-accent">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{course.title}</span>
                    {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{course.shortDescription ?? course.description}</p>
                  <p className="mt-4 text-sm text-muted-foreground">{course.modules.length} modulos</p>
                  {!unlocked && <p className="mt-1 text-xs text-accent">Disponivel no plano {course.requiredTier}</p>}
                </CardContent>
              </Card>
            </Link>
          );
        })}
        {courses.length === 0 && <Card><CardContent className="pt-0 text-sm text-muted-foreground">Nenhum material publicado ainda.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
