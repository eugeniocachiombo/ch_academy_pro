-- DropForeignKey
ALTER TABLE "Permition" DROP CONSTRAINT "Permition_school_id_fkey";

-- AlterTable
ALTER TABLE "Permition" ALTER COLUMN "school_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Permition" ADD CONSTRAINT "Permition_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
