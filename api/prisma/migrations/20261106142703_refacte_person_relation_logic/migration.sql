/*
  Warnings:

  - You are about to drop the column `student_id` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_id` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `Person` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_student_id_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_user_id_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "student_id",
DROP COLUMN "teacher_id",
DROP COLUMN "user_id",
ADD COLUMN     "studentId" INTEGER,
ADD COLUMN     "teacherId" INTEGER;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;
