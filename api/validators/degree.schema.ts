import { z } from "zod";

export const createDegreeSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateDegreeSchema = createDegreeSchema.partial();