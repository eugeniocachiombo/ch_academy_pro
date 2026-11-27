-- AlterTable
ALTER TABLE "StudentPresence" ADD COLUMN     "schedule_id" INTEGER;

-- AddForeignKey
ALTER TABLE "StudentPresence" ADD CONSTRAINT "StudentPresence_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "Schedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
