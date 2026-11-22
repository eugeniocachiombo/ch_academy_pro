import { z } from "zod";

export const createDepartmentSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    editable: z.boolean().optional(),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();