-- DropIndex
DROP INDEX "Teacher_codenumber_key";

-- AlterTable
ALTER TABLE "Teacher" ALTER COLUMN "codenumber" DROP DEFAULT,
ALTER COLUMN "codenumber" SET DATA TYPE TEXT;
DROP SEQUENCE "Teacher_codenumber_seq";
