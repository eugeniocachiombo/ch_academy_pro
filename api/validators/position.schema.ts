import { z } from "zod";

export const createPositionSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    department_id: z.number().int().positive().nullable().optional(),
    editable: z.boolean().optional(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updatePositionSchema = createPositionSchema.partial();