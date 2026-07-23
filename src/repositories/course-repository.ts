import { prisma } from "@/lib/prisma";
import type { CourseDifficulty, CourseStatus, PlanTier } from "@/generated/prisma";

export type CourseInput = {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  status?: CourseStatus;
  difficulty?: CourseDifficulty;
  requiredTier?: PlanTier;
};

export type CourseModuleInput = {
  title: string;
  description?: string;
  order: number;
};

export type CourseLessonInput = {
  title: string;
  description?: string;
  videoId?: string;
  durationInMs: number;
  order: number;
};

export async function listCourses() {
  return prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { modules: true } } },
  });
}

export async function getCourseWithContent(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });
}

export async function getPublishedCourseBySlug(slug: string) {
  return prisma.course.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { modules: { include: { lessons: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } } },
  });
}

export async function createCourse(input: CourseInput) {
  return prisma.course.create({ data: input });
}

export async function updateCourse(courseId: string, input: Partial<CourseInput>) {
  return prisma.course.update({ where: { id: courseId }, data: input });
}

export async function deleteCourse(courseId: string) {
  return prisma.course.delete({ where: { id: courseId } });
}

export async function createModule(courseId: string, input: CourseModuleInput) {
  return prisma.courseModule.create({ data: { courseId, ...input } });
}

export async function updateModule(moduleId: string, input: Partial<CourseModuleInput>) {
  return prisma.courseModule.update({ where: { id: moduleId }, data: input });
}

export async function deleteModule(moduleId: string) {
  return prisma.courseModule.delete({ where: { id: moduleId } });
}

export async function createLesson(moduleId: string, input: CourseLessonInput) {
  return prisma.courseLesson.create({ data: { moduleId, ...input } });
}

export async function updateLesson(lessonId: string, input: Partial<CourseLessonInput>) {
  return prisma.courseLesson.update({ where: { id: lessonId }, data: input });
}

export async function deleteLesson(lessonId: string) {
  return prisma.courseLesson.delete({ where: { id: lessonId } });
}

export async function getLessonWithModuleAndCourse(lessonId: string) {
  return prisma.courseLesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
}

export async function getProgressForUser(userId: string, lessonIds: string[]) {
  return prisma.courseProgress.findMany({ where: { userId, lessonId: { in: lessonIds } } });
}

export async function markLessonComplete(userId: string, lessonId: string) {
  return prisma.courseProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  });
}

export async function unmarkLessonComplete(userId: string, lessonId: string) {
  await prisma.courseProgress.deleteMany({ where: { userId, lessonId } });
}
