import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { listCourses } from "@/repositories/course-repository";
import { CourseManager } from "@/components/admin/course-manager";

export default async function AdminCoursesPage() {
  await requireRole(["admin", "super_admin"]);
  const courses = await listCourses();

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Gerenciar cursos</h1>
      <Card>
        <CardHeader>
          <CardTitle>Cursos cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseManager initialCourses={courses} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
