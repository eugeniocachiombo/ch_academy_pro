/*
  Warnings:

  - A unique constraint covering the columns `[role_id,permition_id,school_id]` on the table `RolePermition` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,role_id,school_id]` on the table `UserRole` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "RolePermition_role_id_permition_id_key";

-- DropIndex
DROP INDEX "UserRole_user_id_role_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "RolePermition_role_id_permition_id_school_id_key" ON "RolePermition"("role_id", "permition_id", "school_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_user_id_role_id_school_id_key" ON "UserRole"("user_id", "role_id", "school_id");
