import { z } from "zod";

export const createCourseSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }),
    code: z.string({ required_error: "O código é obrigatório" }),
    description: z.string().optional().nullable(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateCourseSchema = createCourseSchema.partial();