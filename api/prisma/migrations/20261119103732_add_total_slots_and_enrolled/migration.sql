-- AlterTable
ALTER TABLE "Groupconfig" ADD COLUMN     "total_enrolled" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "total_slots" INTEGER NOT NULL DEFAULT 0;
