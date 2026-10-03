-- CreateTable
CREATE TABLE "AcademicClass" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "AcademicClass_pkey" PRIMARY KEY ("id")
);
