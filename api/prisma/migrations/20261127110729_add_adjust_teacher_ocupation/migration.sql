/*
  Warnings:

  - You are about to drop the column `groupconfigId` on the `Teacherocupation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacher_id,subject_id,year_id,groupconfig_id]` on the table `Teacherocupation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupconfig_id` to the `Teacherocupation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Teacherocupation" DROP CONSTRAINT "Teacherocupation_groupconfigId_fkey";

-- DropIndex
DROP INDEX "Teacherocupation_teacher_id_subject_id_year_id_key";

-- AlterTable
ALTER TABLE "Teacherocupation" DROP COLUMN "groupconfigId",
ADD COLUMN     "groupconfig_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Teacherocupation_teacher_id_subject_id_year_id_groupconfig__key" ON "Teacherocupation"("teacher_id", "subject_id", "year_id", "groupconfig_id");

-- AddForeignKey
ALTER TABLE "Teacherocupation" ADD CONSTRAINT "Teacherocupation_groupconfig_id_fkey" FOREIGN KEY ("groupconfig_id") REFERENCES "Groupconfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
