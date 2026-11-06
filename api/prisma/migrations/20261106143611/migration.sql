/*
  Warnings:

  - You are about to drop the column `studentId` on the `Person` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `Person` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_teacherId_fkey";

-- AlterTable
ALTER TABLE "Person" DROP COLUMN "studentId",
DROP COLUMN "teacherId";
