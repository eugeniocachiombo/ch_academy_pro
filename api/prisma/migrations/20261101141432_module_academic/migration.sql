/*
  Warnings:

  - You are about to drop the `AcademicClass` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `academic_grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `academic_rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `academic_years` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `course_grades` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `grade_subjects` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `subjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "RegisterStatus" AS ENUM ('ACTIVE', 'TRANSFER', 'GIVEUP', 'CONCLUD', 'CANCELED');

-- DropForeignKey
ALTER TABLE "course_grades" DROP CONSTRAINT "course_grades_courseId_fkey";

-- DropForeignKey
ALTER TABLE "course_grades" DROP CONSTRAINT "course_grades_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "grade_subjects" DROP CONSTRAINT "grade_subjects_gradeId_fkey";

-- DropForeignKey
ALTER TABLE "grade_subjects" DROP CONSTRAINT "grade_subjects_subjectId_fkey";

-- DropTable
DROP TABLE "AcademicClass";

-- DropTable
DROP TABLE "academic_grades";

-- DropTable
DROP TABLE "academic_rooms";

-- DropTable
DROP TABLE "academic_years";

-- DropTable
DROP TABLE "course_grades";

-- DropTable
DROP TABLE "courses";

-- DropTable
DROP TABLE "grade_subjects";

-- DropTable
DROP TABLE "subjects";

-- CreateTable
CREATE TABLE "Class" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groupconfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year_id" INTEGER NOT NULL,
    "course_id" INTEGER NOT NULL,
    "class_id" INTEGER NOT NULL,
    "period_id" INTEGER NOT NULL,
    "room_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Groupconfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Period" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Register" (
    "id" SERIAL NOT NULL,
    "registnum" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "groupconfig_id" INTEGER NOT NULL,
    "year_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3),
    "status" "RegisterStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Register_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacherocupation" (
    "id" SERIAL NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "groupconfig_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "year_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Teacherocupation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Year" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "startdate" TIMESTAMP(3),
    "enddate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Year_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Group_name_key" ON "Group"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Groupconfig_year_id_course_id_class_id_period_id_room_id_key" ON "Groupconfig"("year_id", "course_id", "class_id", "period_id", "room_id");

-- CreateIndex
CREATE UNIQUE INDEX "Period_name_key" ON "Period"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Register_registnum_key" ON "Register"("registnum");

-- CreateIndex
CREATE UNIQUE INDEX "Register_year_id_student_id_groupconfig_id_key" ON "Register"("year_id", "student_id", "groupconfig_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacherocupation_teacher_id_groupconfig_id_subject_id_year__key" ON "Teacherocupation"("teacher_id", "groupconfig_id", "subject_id", "year_id");

-- CreateIndex
CREATE UNIQUE INDEX "Year_name_key" ON "Year"("name");

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "Year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "Period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "Year"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Register" ADD CONSTRAINT "Register_groupconfig_id_fkey" FOREIGN KEY ("groupconfig_id") REFERENCES "Groupconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_groupconfig_id_fkey" FOREIGN KEY ("groupconfig_id") REFERENCES "Groupconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "Year"("id") ON DELETE CASCADE ON UPDATE CASCADE;
