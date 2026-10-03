import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createAcademicClassSchema = z.object({
    name: z.string().min(2, "O nome da turma deve ter pelo menos 2 caracteres")
}).refine(async (data) => {
    const existing = await prisma.academicClass.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe uma turma registada com este nome.",
    path: ["name"]
});

export const updateAcademicClassSchema = z.object({
    name: z.string().min(2, "O nome da turma deve ter pelo menos 2 caracteres").optional()
}).refine(async (data) => {
    if (!data.name) return true;
    const existing = await prisma.academicClass.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe uma turma registada com este nome.",
    path: ["name"]
});

export type CreateAcademicClassInput = z.infer<typeof createAcademicClassSchema>;
export type UpdateAcademicClassInput = z.infer<typeof updateAcademicClassSchema>;

class AcademicClassRepository extends Crud {
    constructor() {
        super("academicClass", {
            create: createAcademicClassSchema,
            update: updateAcademicClassSchema
        });
    }
}

export const academicClassRepository = new AcademicClassRepository();