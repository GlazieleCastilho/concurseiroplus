import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser, hasPlanAccess } from "@/lib/clerk";
import { getPublishedCourseBySlug, getProgressForUser } from "@/repositories/course-repository";
import { LessonCompleteButton } from "@/components/courses/lesson-complete-button";

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const user = await getCurrentDbUser();
  const course = await getPublishedCourseBySlug(slug);
  if (!course) notFound();

  if (!hasPlanAccess(user.planTier, course.requiredTier)) {
    redirect(`/material-estudos/${slug}`);
  }

  const orderedLessons = course.modules
    .flatMap((module) => module.lessons.map((lesson) => ({ ...lesson, moduleTitle: module.title })));
  const currentIndex = orderedLessons.findIndex((lesson) => lesson.id === lessonId);
  if (currentIndex === -1) notFound();
  const lesson = orderedLessons[currentIndex];
  const previous = orderedLessons[currentIndex - 1];
  const next = orderedLessons[currentIndex + 1];

  const progress = await getProgressForUser(user.id, [lesson.id]);
  const completed = progress.length > 0;

  return (
    <AppShell>
      <div>
        <Link href={`/material-estudos/${slug}`} className="text-sm text-muted-foreground hover:underline">← {course.title}</Link>
        <h1 className="font-display text-2xl font-bold">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground">{lesson.moduleTitle}</p>
      </div>

      {lesson.videoId ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg border border-border">
          <iframe
            className="h-full w-full"
            src={`https://www.youtube.com/embed/${lesson.videoId}`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <Card><CardContent className="pt-6 text-sm text-muted-foreground">Esta aula ainda nao tem video cadastrado.</CardContent></Card>
      )}

      {lesson.description && (
        <Card>
          <CardHeader><CardTitle>Sobre esta aula</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{lesson.description}</CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {previous && (
            <Link href={`/material-estudos/${slug}/${previous.id}`}>
              <Button variant="outline">← {previous.title}</Button>
            </Link>
          )}
          {next && (
            <Link href={`/material-estudos/${slug}/${next.id}`}>
              <Button variant="outline">{next.title} →</Button>
            </Link>
          )}
        </div>
        <LessonCompleteButton courseId={course.id} lessonId={lesson.id} initialCompleted={completed} />
      </div>
    </AppShell>
  );
}
