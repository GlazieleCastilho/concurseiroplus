import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import sampleCourses from "./sample-courses.json";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const courseData of sampleCourses) {
    const { tags, modules, ...course } = courseData;

    const createdCourse = await prisma.course.create({
      data: {
        ...course,
        status: "PUBLISHED",
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
        modules: {
          create: modules.map((courseModule, index) => ({
            title: courseModule.title,
            description: courseModule.description,
            order: index + 1,
            lessons: {
              create: courseModule.lessons.map((lesson, lessonIndex) => ({
                title: lesson.title,
                description: lesson.description,
                videoId: lesson.videoId,
                durationInMs: lesson.durationInMs,
                order: lessonIndex + 1,
              })),
            },
          })),
        },
      },
    });

    console.log(`Curso criado: ${createdCourse.title}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });