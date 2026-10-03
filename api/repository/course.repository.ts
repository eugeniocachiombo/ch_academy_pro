import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createCourseSchema = z.object({
    name: z.string().min(3, "O nome do curso deve ter pelo menos 3 caracteres"),
    code: z.string().min(2, "O código do curso deve ter pelo menos 2 caracteres (Ex: INF, BIO)"),
    description: z.string().optional()
});

export const updateCourseSchema = z.object({
    name: z.string().min(3, "O nome do curso deve ter pelo menos 3 caracteres").optional(),
    code: z.string().min(2, "O código do curso deve ter pelo menos 2 caracteres").optional(),
    description: z.string().optional()
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

class CourseRepository extends Crud {
    constructor() {
        super("course", {
            create: createCourseSchema,
            update: updateCourseSchema
        });
    }

    async create(data: any) {
        // Validação de duplicados (Nome ou Código)
        const existing = await prisma.course.findFirst({
            where: {
                OR: [{ name: data.name }, { code: data.code }]
            }
        });
        if (existing) {
            const field = existing.name === data.name ? 'name' : 'code';
            const message = field === 'name' ? 'Já existe um curso com este nome.' : 'Já existe um curso com este código.';
            throw { response: { data: { errors: { [field]: [message] } } } };
        }

        return await prisma.course.create({ data });
    }

    async update(id: number | string, data: any) {
        const numericId = Number(id);

        if (data.name || data.code) {
            const conditions: any[] = [];
            if (data.name) conditions.push({ name: data.name });
            if (data.code) conditions.push({ code: data.code });

            const existing = await prisma.course.findFirst({
                where: {
                    OR: conditions,
                    NOT: { id: numericId }
                }
            });

            if (existing) {
                const field = data.name && existing.name === data.name ? 'name' : 'code';
                const message = field === 'name' ? 'Já existe um curso com este nome.' : 'Já existe um curso com este código.';
                throw { response: { data: { errors: { [field]: [message] } } } };
            }
        }

        return await prisma.course.update({
            where: { id: numericId },
            data
        });
    }
}

export const courseRepository = new CourseRepository();