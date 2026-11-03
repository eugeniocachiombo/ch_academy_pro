import { z } from "zod";

export const createPeriodSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    hourstart: z.string().datetime().optional().nullable(),
    hourend: z.string().datetime().optional().nullable(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updatePeriodSchema = createPeriodSchema.partial();