import { z } from "zod";

export const createPeriodSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    description: z.string().optional().nullable(),
    starthour: z.string().optional().nullable(),
    endhour: z.string().optional().nullable(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updatePeriodSchema = createPeriodSchema.partial();