/*
  Warnings:

  - A unique constraint covering the columns `[groupconfig_id,year_id,day_of_week,start_time]` on the table `Schedule` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `year_id` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Schedule_groupconfig_id_day_of_week_start_time_key";

-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "year_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_groupconfig_id_year_id_day_of_week_start_time_key" ON "Schedule"("groupconfig_id", "year_id", "day_of_week", "start_time");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_year_id_fkey" FOREIGN KEY ("year_id") REFERENCES "Year"("id") ON DELETE CASCADE ON UPDATE CASCADE;
