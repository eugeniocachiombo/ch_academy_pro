/*
  Warnings:

  - A unique constraint covering the columns `[date,groupconfig_id,subject_id,schedule_id]` on the table `StudentPresence` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudentPresence_date_groupconfig_id_subject_id_schedule_id_key" ON "StudentPresence"("date", "groupconfig_id", "subject_id", "schedule_id");
