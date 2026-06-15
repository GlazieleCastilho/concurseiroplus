import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/clerk";
import { getCourses } from "@/repositories/catalog-repository";

export default async function MaterialEstudosPage() {
  await getCurrentDbUser();
  const courses = await getCourses();
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Material de estudos</h1>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader><CardTitle>{course.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{course.shortDescription ?? course.description}</p>
              <p className="mt-4 text-sm text-muted-foreground">{course.modules.length} modulos</p>
            </CardContent>
          </Card>
        ))}
        {courses.length === 0 && <Card><CardContent className="pt-0 text-sm text-muted-foreground">Nenhum material publicado ainda.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
