-- CreateTable
CREATE TABLE "academic_grades" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "academic_grades_pkey" PRIMARY KEY ("id")
);
