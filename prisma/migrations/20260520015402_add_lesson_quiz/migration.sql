-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "lessonId" TEXT,
ALTER COLUMN "moduleId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
