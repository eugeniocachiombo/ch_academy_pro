import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createSubjectSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório." }).min(2, "O nome da disciplina deve ter pelo menos 2 caracteres."),
    code: z.string({ required_error: "O código é obrigatório." }).min(1, "O código é obrigatório."),
    description: z.string().optional().nullable(),
}).refine(async (data) => {
    const existing = await prisma.subject.findFirst({ where: { code: data.code } });
    return !existing;
}, {
    message: "Já existe uma disciplina registada com este código.",
    path: ["code"]
});

export const updateSubjectSchema = z.object({
    name: z.string().min(2, "O nome da disciplina deve ter pelo menos 2 caracteres.").optional(),
    code: z.string().min(1, "O código é obrigatório.").optional(),
    description: z.string().optional().nullable(),
}).refine(async (data) => {
    if (!data.code) return true;
    const existing = await prisma.subject.findFirst({ where: { code: data.code } });
    return !existing;
}, {
    message: "Já existe uma disciplina registada com este código.",
    path: ["code"]
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

class SubjectRepository extends Crud {
    constructor() {
        super("subject", {
            create: createSubjectSchema,
            update: updateSubjectSchema
        });
    }
}

export const subjectRepository = new SubjectRepository();