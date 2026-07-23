-- AlterTable: nivel goes from a single ExamLevel to ExamLevel[] (a concurso can span multiple levels)
ALTER TABLE "provas" ALTER COLUMN "nivel" DROP DEFAULT;
ALTER TABLE "provas" ALTER COLUMN "nivel" TYPE "ExamLevel"[] USING ARRAY["nivel"];
ALTER TABLE "provas" ALTER COLUMN "nivel" SET DEFAULT ARRAY['SUPERIOR']::"ExamLevel"[];
