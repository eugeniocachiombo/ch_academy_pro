import { z } from "zod";

export const createDepartmentSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    editable: z.boolean().optional(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();