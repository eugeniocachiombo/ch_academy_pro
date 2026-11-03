-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_school_id_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "school_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
