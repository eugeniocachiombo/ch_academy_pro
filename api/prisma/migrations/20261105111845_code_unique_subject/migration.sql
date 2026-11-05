/*
  Warnings:

  - A unique constraint covering the columns `[code,school_id]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_school_id_key" ON "Subject"("code", "school_id");
