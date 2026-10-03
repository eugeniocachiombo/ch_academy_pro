-- CreateTable
CREATE TABLE "grade_subjects" (
    "id" SERIAL NOT NULL,
    "gradeId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "grade_subjects_gradeId_subjectId_key" ON "grade_subjects"("gradeId", "subjectId");

-- AddForeignKey
ALTER TABLE "grade_subjects" ADD CONSTRAINT "grade_subjects_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "academic_grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grade_subjects" ADD CONSTRAINT "grade_subjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
