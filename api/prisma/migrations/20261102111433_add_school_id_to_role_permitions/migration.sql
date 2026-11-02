-- AlterTable
ALTER TABLE "RolePermition" ADD COLUMN     "school_id" INTEGER;

-- AddForeignKey
ALTER TABLE "RolePermition" ADD CONSTRAINT "RolePermition_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
