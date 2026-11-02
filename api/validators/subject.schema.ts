import { z } from "zod";

export const createSubjectSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }),
    description: z.string().optional().nullable()
});

export const updateSubjectSchema = createSubjectSchema.partial();