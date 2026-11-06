-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "processnum" DROP DEFAULT,
ALTER COLUMN "processnum" SET DATA TYPE TEXT;
DROP SEQUENCE "Student_processnum_seq";
