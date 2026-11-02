import { z } from "zod";

export const createYearSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }),
    startdate: z.string().datetime().optional().nullable(),
    enddate: z.string().datetime().optional().nullable(),
    isCurrent: z.boolean().optional(),
    school_id: z.number({ required_error: "O school_id é obrigatório" })
});

export const updateYearSchema = createYearSchema.partial();