/*
  Warnings:

  - You are about to drop the column `studentId` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Person` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_teacherId_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "studentId",
DROP COLUMN "teacherId",
ADD COLUMN     "student_id" INTEGER,
ADD COLUMN     "teacher_id" INTEGER;

-- CreateTable
CREATE TABLE "Subjectclass" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Subjectclass_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjectclass" ADD CONSTRAINT "Subjectclass_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjectclass" ADD CONSTRAINT "Subjectclass_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
