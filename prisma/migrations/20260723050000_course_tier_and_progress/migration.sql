-- AlterTable
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "requiredTier" "PlanTier" NOT NULL DEFAULT 'ESSENCIAL';

-- CreateTable
CREATE TABLE IF NOT EXISTS "course_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "course_progress_userId_lessonId_key" ON "course_progress"("userId", "lessonId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "course_progress_userId_idx" ON "course_progress"("userId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "course_progress" ADD CONSTRAINT "course_progress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "course_lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
