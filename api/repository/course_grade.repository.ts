import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createCourseGradeSchema = z.object({
    courseId: z.number({ required_error: "O curso é obrigatório." }),
    gradeIds: z.array(z.number()).min(1, "Selecione pelo menos uma classe.")
});

export const updateCourseGradeSchema = z.object({
    courseId: z.number().optional(),
    gradeIds: z.array(z.number()).min(1, "Selecione pelo menos uma classe.").optional()
});

class CourseGradeRepository extends Crud {
    constructor() {
        super("courseGrade", {
            create: createCourseGradeSchema,
            update: updateCourseGradeSchema
        });
    }

    // Retorna agrupado por curso para uma visualização limpa
    async list(filters: any = {}) {
        const grades = await prisma.courseGrade.findMany({
            where: filters,
            include: {
                course: true,
                grade: true
            },
            orderBy: { course: { name: 'asc' } }
        });

        // Agrupa por curso para a nova interface dinâmica
        const groupedMap = new Map();
        for (const item of grades) {
            if (!groupedMap.has(item.courseId)) {
                groupedMap.set(item.courseId, {
                    id: item.courseId,
                    course: item.course,
                    grades: []
                });
            }
            if (item.grade) {
                groupedMap.get(item.courseId).grades.push(item.grade);
            }
        }

        return Array.from(groupedMap.values());
    }

    async findById(id: number | string) {
        // O ID aqui passa a ser o courseId para facilitar a edição em lote
        const courseId = Number(id);
        const courseGrades = await prisma.courseGrade.findMany({
            where: { courseId },
            include: { course: true, grade: true }
        });

        if (courseGrades.length === 0) return null;

        return {
            courseId,
            course: courseGrades[0].course,
            gradeIds: courseGrades.map(cg => cg.gradeId)
        };
    }

    // Sincroniza em lote (substitui as classes anteriores do curso pelas novas)
    async create(data: any) {
        const courseId = Number(data.courseId);
        const gradeIds: number[] = data.gradeIds || [];

        return await prisma.$transaction(async (tx) => {
            // Remove associações antigas deste curso
            await tx.courseGrade.deleteMany({ where: { courseId } });

            // Cria as novas associações em lote
            if (gradeIds.length > 0) {
                const records = gradeIds.map(gradeId => ({ courseId, gradeId: Number(gradeId) }));
                await tx.courseGrade.createMany({ data: records });
            }

            return await tx.courseGrade.findMany({
                where: { courseId },
                include: { course: true, grade: true }
            });
        });
    }

    async update(id: number | string, data: any) {
        return await this.create({ courseId: id, gradeIds: data.gradeIds });
    }

    async remove(id: number | string) {
        const courseId = Number(id);
        return await prisma.courseGrade.deleteMany({ where: { courseId } });
    }
}

export const courseGradeRepository = new CourseGradeRepository();