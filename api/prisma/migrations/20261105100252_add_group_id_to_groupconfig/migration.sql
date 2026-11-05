/*
  Warnings:

  - Added the required column `group_id` to the `Groupconfig` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Groupconfig" ADD COLUMN     "group_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Groupconfig" ADD CONSTRAINT "Groupconfig_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
