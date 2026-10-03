import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createAcademicGradeSchema = z.object({
    name: z.string().min(2, "O nome da classe deve ter pelo menos 2 caracteres")
}).refine(async (data) => {
    const existing = await prisma.academicGrade.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe uma classe registada com este nome.",
    path: ["name"]
});

export const updateAcademicGradeSchema = z.object({
    name: z.string().min(2, "O nome da classe deve ter pelo menos 2 caracteres").optional()
}).refine(async (data) => {
    if (!data.name) return true;
    const existing = await prisma.academicGrade.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe uma classe registada com este nome.",
    path: ["name"]
});

export type CreateAcademicGradeInput = z.infer<typeof createAcademicGradeSchema>;
export type UpdateAcademicGradeInput = z.infer<typeof updateAcademicGradeSchema>;

class AcademicGradeRepository extends Crud {
    constructor() {
        super("academicGrade", {
            create: createAcademicGradeSchema,
            update: updateAcademicGradeSchema
        });
    }
}

export const academicGradeRepository = new AcademicGradeRepository();