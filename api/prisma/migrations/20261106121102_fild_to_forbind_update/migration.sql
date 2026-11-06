-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Degree" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Periodstudy" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Permition" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "RolePermition" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "editable" BOOLEAN DEFAULT true;

-- AlterTable
ALTER TABLE "UserRole" ADD COLUMN     "editable" BOOLEAN DEFAULT true;
