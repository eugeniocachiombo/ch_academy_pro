/*
  Warnings:

  - A unique constraint covering the columns `[bi_number]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nif]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bi_number` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `municipality` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `neighborhood` to the `Person` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Person" ADD COLUMN     "alternative_phone" TEXT,
ADD COLUMN     "bi_number" TEXT NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "house_number" TEXT,
ADD COLUMN     "municipality" TEXT NOT NULL,
ADD COLUMN     "neighborhood" TEXT NOT NULL,
ADD COLUMN     "nif" TEXT,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "street" TEXT,
ALTER COLUMN "middlename" DROP NOT NULL,
ALTER COLUMN "phone" SET DATA TYPE TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "student_number" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "guardian_name" TEXT NOT NULL,
    "guardian_phone" TEXT NOT NULL,
    "guardian_bi" TEXT,
    "origin_school" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "teacher_number" SERIAL NOT NULL,
    "person_id" INTEGER NOT NULL,
    "academic_degree" TEXT,
    "specialty" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_student_number_key" ON "Student"("student_number");

-- CreateIndex
CREATE UNIQUE INDEX "Student_person_id_key" ON "Student"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_teacher_number_key" ON "Teacher"("teacher_number");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_person_id_key" ON "Teacher"("person_id");

-- CreateIndex
CREATE UNIQUE INDEX "Person_bi_number_key" ON "Person"("bi_number");

-- CreateIndex
CREATE UNIQUE INDEX "Person_nif_key" ON "Person"("nif");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Teacher" ADD CONSTRAINT "Teacher_person_id_fkey" FOREIGN KEY ("person_id") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE;
