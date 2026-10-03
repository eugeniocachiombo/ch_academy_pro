import { z } from 'zod';
import { prisma } from '../lib/prisma';

export const assignSubjectsToGradeSchema = z.object({
    gradeId: z.number({ required_error: "A classe é obrigatória." }),
    subjectIds: z.array(z.number(), { required_error: "A lista de disciplinas é obrigatória." })
});

export type AssignSubjectsInput = z.infer<typeof assignSubjectsToGradeSchema>;

class GradeSubjectRepository {
    async listByGrade(gradeId: number) {
        return await prisma.gradeSubject.findMany({
            where: { gradeId },
            include: { subject: true, grade: true }
        });
    }

    async listAllGrouped() {
        const grades = await prisma.academicGrade.findMany({
            include: {
                gradeSubjects: {
                    include: { subject: true }
                }
            }
        });
        return grades;
    }

    async saveGradeSubjects(data: AssignSubjectsInput) {
        
        const validated = await assignSubjectsToGradeSchema.parseAsync(data);
        
        return await prisma.$transaction(async (tx) => {
          
            await tx.gradeSubject.deleteMany({
                where: { gradeId: validated.gradeId }
            });
            
            if (validated.subjectIds.length > 0) {
                const dataToInsert = validated.subjectIds.map(subjectId => ({
                    gradeId: validated.gradeId,
                    subjectId
                }));
                await tx.gradeSubject.createMany({
                    data: dataToInsert,
                    skipDuplicates: true
                });
            }
          
            return await tx.academicGrade.findUnique({
                where: { id: validated.gradeId },
                include: { gradeSubjects: { include: { subject: true } } }
            });
        });
    }

    async remove(gradeId: number) {
        return await prisma.gradeSubject.deleteMany({
            where: { gradeId }
        });
    }
}

export const gradeSubjectRepository = new GradeSubjectRepository();