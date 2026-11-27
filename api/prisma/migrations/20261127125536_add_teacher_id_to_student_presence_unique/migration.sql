/*
  Warnings:

  - A unique constraint covering the columns `[school_id,teacher_id,date,groupconfig_id,subject_id,schedule_id]` on the table `StudentPresence` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "StudentPresence_date_groupconfig_id_subject_id_schedule_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "StudentPresence_school_id_teacher_id_date_groupconfig_id_su_key" ON "StudentPresence"("school_id", "teacher_id", "date", "groupconfig_id", "subject_id", "schedule_id");
