import { z } from "zod";

export const createSubjectSchema = z.object({
    code: z.string({ required_error: "O código é obrigatório" }).min(1, "O código é obrigatório"),
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    description: z.string().optional().nullable(),
    school_id: z.number().optional().nullable()
});

export const updateSubjectSchema = createSubjectSchema.partial();