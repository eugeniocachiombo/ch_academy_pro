-- AlterTable
ALTER TABLE "StudentPresence" ADD COLUMN     "created_by" INTEGER;

-- AddForeignKey
ALTER TABLE "StudentPresence" ADD CONSTRAINT "StudentPresence_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
