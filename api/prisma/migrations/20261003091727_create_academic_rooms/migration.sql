-- CreateTable
CREATE TABLE "academic_rooms" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "academic_rooms_pkey" PRIMARY KEY ("id")
);
