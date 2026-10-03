import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createAcademicYearSchema = z.object({
    name: z.string().min(4, "O ano lectivo deve ter pelo menos 4 caracteres (Ex: 2026/2027)"),
    isCurrent: z.boolean().optional()
}).refine(async (data) => {
    const existing = await prisma.academicYear.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe um ano lectivo registado com este nome.",
    path: ["name"]
});

export const updateAcademicYearSchema = z.object({
    name: z.string().min(4, "O ano lectivo deve ter pelo menos 4 caracteres").optional(),
    isCurrent: z.boolean().optional()
});

export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;

class AcademicYearRepository extends Crud {
    constructor() {
        super("academicYear", {
            create: createAcademicYearSchema,
            update: updateAcademicYearSchema
        });
    }

    
    async create(data: any) {
        
        const existing = await prisma.academicYear.findFirst({ where: { name: data.name } });
        if (existing) {
            throw { response: { data: { errors: { name: ["Já existe um ano lectivo registado com este nome."] } } } };
        }

        return await prisma.$transaction(async (tx) => {
            if (data.isCurrent) {
                await tx.academicYear.updateMany({ data: { isCurrent: false } });
            }
            return await tx.academicYear.create({ data });
        });
    }

    
    async update(id: number | string, data: any) {
        const numericId = Number(id);

        if (data.name) {
            const existing = await prisma.academicYear.findFirst({
                where: {
                    name: data.name,
                    NOT: { id: numericId } 
                }
            });
            if (existing) {
                throw { response: { data: { errors: { name: ["Já existe um ano lectivo registado com este nome."] } } } };
            }
        }

        return await prisma.$transaction(async (tx) => {
            if (data.isCurrent) {
                await tx.academicYear.updateMany({
                    where: { NOT: { id: numericId } },
                    data: { isCurrent: false }
                });
            }
            return await tx.academicYear.update({
                where: { id: numericId },
                data
            });
        });
    }
}

export const academicYearRepository = new AcademicYearRepository();