-- CreateTable
CREATE TABLE "course_grades" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "course_grades_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "course_grades_courseId_gradeId_key" ON "course_grades"("courseId", "gradeId");

-- AddForeignKey
ALTER TABLE "course_grades" ADD CONSTRAINT "course_grades_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "course_grades" ADD CONSTRAINT "course_grades_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
