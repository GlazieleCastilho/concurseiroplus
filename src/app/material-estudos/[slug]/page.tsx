import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, CheckCircle2, Circle } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser, hasPlanAccess } from "@/lib/clerk";
import { getPublishedCourseBySlug, getProgressForUser } from "@/repositories/course-repository";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentDbUser();
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();

  const unlocked = hasPlanAccess(user.planTier, course.requiredTier);
  const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
  const progress = unlocked ? await getProgressForUser(user.id, lessonIds) : [];
  const completedIds = new Set(progress.map((item) => item.lessonId));

  return (
    <AppShell>
      <div>
        <Link href="/material-estudos" className="text-sm text-muted-foreground hover:underline">← Material de estudos</Link>
        <h1 className="font-display text-3xl font-bold">{course.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
        {lessonIds.length > 0 && unlocked && (
          <p className="mt-2 text-sm text-accent">{completedIds.size}/{lessonIds.length} aulas concluidas</p>
        )}
      </div>

      {!unlocked && (
        <Card className="border-accent">
          <CardContent className="flex items-center justify-between gap-4 pt-6">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4" />
              <span>Este curso requer o plano {course.requiredTier} ou superior.</span>
            </div>
            <Link href="/billing"><Button size="sm">Fazer upgrade</Button></Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {course.modules.map((module) => (
          <Card key={module.id}>
            <CardHeader><CardTitle>{module.title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {module.description && <p className="text-sm text-muted-foreground">{module.description}</p>}
              {module.lessons.map((lesson) =>
                unlocked ? (
                  <Link
                    key={lesson.id}
                    href={`/material-estudos/${course.slug}/${lesson.id}`}
                    className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm hover:border-accent"
                  >
                    <span className="flex items-center gap-2">
                      {completedIds.has(lesson.id) ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      {lesson.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{Math.round(lesson.durationInMs / 60_000)} min</span>
                  </Link>
                ) : (
                  <div key={lesson.id} className="flex items-center justify-between gap-2 rounded-md border border-border p-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> {lesson.title}</span>
                    <span className="text-xs">{Math.round(lesson.durationInMs / 60_000)} min</span>
                  </div>
                )
              )}
              {module.lessons.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma aula neste modulo ainda.</p>}
            </CardContent>
          </Card>
        ))}
        {course.modules.length === 0 && <p className="text-sm text-muted-foreground">Nenhum modulo publicado ainda.</p>}
      </div>
    </AppShell>
  );
}
