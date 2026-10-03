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
}).refine(async (data) => {
    if (!data.name) return true;
    const existing = await prisma.academicYear.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe um ano lectivo registado com este nome.",
    path: ["name"]
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
}

export const academicYearRepository = new AcademicYearRepository();