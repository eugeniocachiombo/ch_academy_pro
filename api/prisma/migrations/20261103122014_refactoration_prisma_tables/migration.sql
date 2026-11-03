/*
  Warnings:

  - You are about to drop the `Subjectclass` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[course_id,class_id,school_id]` on the table `Classcourse` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Degree` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id]` on the table `Group` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[register_id,serviceprice_id,month,school_id]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id]` on the table `Periodstudy` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id,year_id]` on the table `Periodtest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[register_id,subject_id,date]` on the table `Presence` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `School` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[school_id,year_id,service_id,course_id,class_id]` on the table `Serviceprice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,parent_id,school_id]` on the table `Studentparent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id,register_id,subject_id,testtype_id,periodtest_id,year_id]` on the table `Test` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,school_id]` on the table `Year` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_id` to the `Test` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Classcourse" DROP CONSTRAINT "Classcourse_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Groupconfig" DROP CONSTRAINT "Groupconfig_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Parent" DROP CONSTRAINT "Parent_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Period" DROP CONSTRAINT "Period_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Periodstudy" DROP CONSTRAINT "Periodstudy_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Periodtest" DROP CONSTRAINT "Periodtest_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Presence" DROP CONSTRAINT "Presence_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Register" DROP CONSTRAINT "Register_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Room" DROP CONSTRAINT "Room_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Serviceprice" DROP CONSTRAINT "Serviceprice_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Studentparent" DROP CONSTRAINT "Studentparent_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Subjectclass" DROP CONSTRAINT "Subjectclass_class_id_fkey";

-- DropForeignKey
ALTER TABLE "Subjectclass" DROP CONSTRAINT "Subjectclass_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Subjectclass" DROP CONSTRAINT "Subjectclass_subject_id_fkey";

-- DropForeignKey
ALTER TABLE "Teacher" DROP CONSTRAINT "Teacher_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Teacherocupation" DROP CONSTRAINT "Teacherocupation_school_id_fkey";

-- DropForeignKey
ALTER TABLE "Year" DROP CONSTRAINT "Year_school_id_fkey";

-- DropIndex
DROP INDEX "Periodtest_name_key";

-- DropIndex
DROP INDEX "Presence_name_key";

-- DropIndex
DROP INDEX "Studentparent_student_id_parent_id_key";

-- DropIndex
DROP INDEX "Test_name_key";

-- DropIndex
DROP INDEX "Year_name_key";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "school_id" INTEGER;

-- AlterTable
ALTER TABLE "Classcourse" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Degree" ADD COLUMN     "school_id" INTEGER;

-- AlterTable
ALTER TABLE "Group" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Groupconfig" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Parent" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Period" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Periodstudy" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Periodtest" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Presence" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Register" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Serviceprice" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Studentparent" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "school_id" INTEGER;

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Teacherocupation" ALTER COLUMN "school_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Test" ADD COLUMN     "year_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Year" ALTER COLUMN "school_id" DROP NOT NULL;

-- DropTable
DROP TABLE "Subjectclass";

-- CreateTable
CREATE TABLE "ClassSubject" (
    "id" SERIAL NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "school_id" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "ClassSubject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubject_subject_id_class_id_school_id_key" ON "ClassSubject"("subject_id", "class_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Classcourse_course_id_class_id_school_id_key" ON "Classcourse"("course_id", "class_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Degree_name_key" ON "Degree"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_school_id_key" ON "Group"("name", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_register_id_serviceprice_id_month_school_id_key" ON "Payment"("register_id", "serviceprice_id", "month", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Periodstudy_name_school_id_key" ON "Periodstudy"("name", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Periodtest_name_school_id_year_id_key" ON "Periodtest"("name", "school_id", "year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Presence_register_id_subject_id_date_key" ON "Presence"("register_id", "subject_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_school_id_key" ON "Room"("name", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "School"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Serviceprice_school_id_year_id_service_id_course_id_class_i_key" ON "Serviceprice"("school_id", "year_id", "service_id", "course_id", "class_id");

-- CreateIndex
CREATE UNIQUE INDEX "Studentparent_student_id_parent_id_school_id_key" ON "Studentparent"("student_id", "parent_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_name_school_id_key" ON "Subject"("name", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "Test_name_school_id_register_id_subject_id_testtype_id_peri_key" ON "Test"("name", "school_id", "register_id", "subject_id", "testtype_id", "periodtest_id", "year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Year_name_school_id_key" ON "Year"("name", "school_id");

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubject" ADD CONSTRAINT "ClassSubject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classcourse" ADD CONSTRAINT "Classcourse_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Degree" ADD CONSTRAINT "Degree_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parent" ADD CONSTRAINT "Parent_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Period" ADD CONSTRAINT "Period_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periodstudy" ADD CONSTRAINT "Periodstudy_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Periodtest" ADD CONSTRAINT "Periodtest_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Presence" ADD CONSTRAINT "Presence_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Serviceprice" ADD CONSTRAINT "Serviceprice_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Studentparent" ADD CONSTRAINT "Studentparent_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "Year"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Year" ADD CONSTRAINT "Year_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
