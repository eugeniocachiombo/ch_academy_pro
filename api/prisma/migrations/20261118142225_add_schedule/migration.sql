-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY');

-- CreateTable
CREATE TABLE "Schedule" (
    "id" SERIAL NOT NULL,
    "groupconfig_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "school_id" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Schedule_groupconfig_id_day_of_week_start_time_key" ON "Schedule"("groupconfig_id", "day_of_week", "start_time");

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_groupconfig_id_fkey" FOREIGN KEY ("groupconfig_id") REFERENCES "Groupconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
