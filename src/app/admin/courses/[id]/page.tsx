import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/clerk";
import { getCourseWithContent } from "@/repositories/course-repository";
import { CourseContentManager } from "@/components/admin/course-content-manager";

export default async function AdminCourseContentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole(["admin", "super_admin"]);
  const { id } = await params;
  const course = await getCourseWithContent(id);
  if (!course) notFound();

  return (
    <AppShell>
      <div>
        <Link href="/admin/courses" className="text-sm text-muted-foreground hover:underline">← Cursos</Link>
        <h1 className="font-display text-3xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground">{course.status} · {course.modules.length} modulo(s)</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Modulos e aulas</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseContentManager courseId={course.id} initialModules={course.modules} />
        </CardContent>
      </Card>
    </AppShell>
  );
}
