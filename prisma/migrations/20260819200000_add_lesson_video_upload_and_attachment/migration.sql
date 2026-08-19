-- Adiciona suporte a upload de video (alem do YouTube) e anexo de PDF por aula.

-- CreateEnum
CREATE TYPE "LessonVideoSource" AS ENUM ('YOUTUBE', 'UPLOAD');

-- AlterTable
ALTER TABLE "course_lessons" ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentUrl" TEXT,
ADD COLUMN     "videoSource" "LessonVideoSource" NOT NULL DEFAULT 'YOUTUBE',
ADD COLUMN     "videoUrl" TEXT;
