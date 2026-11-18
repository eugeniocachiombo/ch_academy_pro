/*
  Warnings:

  - You are about to drop the column `groupconfig_id` on the `Teacherocupation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacher_id,subject_id,year_id]` on the table `Teacherocupation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Teacherocupation" DROP CONSTRAINT "Teacherocupation_groupconfig_id_fkey";

-- DropIndex
DROP INDEX "Teacherocupation_teacher_id_groupconfig_id_subject_id_year__key";

-- AlterTable
ALTER TABLE "Teacherocupation" DROP COLUMN "groupconfig_id",
ADD COLUMN     "groupconfigId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Teacherocupation_teacher_id_subject_id_year_id_key" ON "Teacherocupation"("teacher_id", "subject_id", "year_id");

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_groupconfigId_fkey" FOREIGN KEY ("groupconfigId") REFERENCES "Groupconfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
