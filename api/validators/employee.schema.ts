import { z } from "zod";

export const createEmployeeSchema = z.object({
    person_id: z.number({ required_error: "A pessoa é obrigatória" }).int().positive(),
    department_id: z.number().int().positive().nullable().optional(),
    position_id: z.number().int().positive().nullable().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();