/*
  Warnings:

  - Added the required column `school_id` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Groupconfig` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Parent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Period` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Permition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Register` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Studentparent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Subjectclass` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Teacher` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Teacherocupation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `UserRole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `school_id` to the `Year` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "School" DROP CONSTRAINT "School_registed_by_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Groupconfig" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Parent" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Period" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Permition" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Register" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "school_id" INTEGER;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Studentparent" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Subjectclass" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Teacher" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Teacherocupation" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "school_id" INTEGER;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Year" ADD COLUMN     "school_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Classcourse" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "school_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Classcourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Classcourse" ADD CONSTRAINT "Classcourse_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classcourse" ADD CONSTRAINT "Classcourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classcourse" ADD CONSTRAINT "Classcourse_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permition" ADD CONSTRAINT "Permition_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Studentparent" ADD CONSTRAINT "Studentparent_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjectclass" ADD CONSTRAINT "Subjectclass_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Year" ADD CONSTRAINT "Year_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
