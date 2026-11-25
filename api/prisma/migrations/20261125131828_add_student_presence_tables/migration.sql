-- CreateTable
CREATE TABLE "StudentPresence" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "groupconfig_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,
    "subject_id" INTEGER NOT NULL,
    "school_id" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "StudentPresence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPresenceList" (
    "id" SERIAL NOT NULL,
    "student_presence_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL,
    "status" "PresenceStatus" NOT NULL DEFAULT 'PRESENT',
    "school_id" INTEGER,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "StudentPresenceList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentPresenceList_student_presence_id_student_id_key" ON "StudentPresenceList"("student_presence_id", "student_id");

-- AddForeignKey
ALTER TABLE "StudentPresence" ADD CONSTRAINT "StudentPresence_groupconfig_id_fkey" FOREIGN KEY ("groupconfig_id") REFERENCES "Groupconfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPresence" ADD CONSTRAINT "StudentPresence_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPresence" ADD CONSTRAINT "StudentPresence_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPresence" ADD CONSTRAINT "StudentPresence_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPresenceList" ADD CONSTRAINT "StudentPresenceList_student_presence_id_fkey" FOREIGN KEY ("student_presence_id") REFERENCES "StudentPresence"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPresenceList" ADD CONSTRAINT "StudentPresenceList_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPresenceList" ADD CONSTRAINT "StudentPresenceList_school_id_fkey" FOREIGN KEY ("school_id") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;
