import { z } from "zod";

export const createRegisterSchema = z.object({
    registnum: z.union([z.number(), z.string(), z.null(), z.undefined()])
        .transform(val => (val !== null && val !== undefined && val !== "" ? Number(val) : null))
        .optional()
        .nullable(),
    student_id: z.any().transform(val => (val !== null && val !== undefined && val !== "" ? Number(val) : null))
        .refine(val => val !== null && !isNaN(val), {
            message: "O aluno é obrigatório"
        }),
    groupconfig_id: z.any().transform(val => (val !== null && val !== undefined && val !== "" ? Number(val) : null))
        .refine(val => val !== null && !isNaN(val), {
            message: "A turma configurada é obrigatória"
        }),
    year_id: z.any().transform(val => (val !== null && val !== undefined && val !== "" ? Number(val) : null))
        .refine(val => val !== null && !isNaN(val), {
            message: "O ano é obrigatório"
        }),
    date: z.string().datetime({ required_error: "A data é obrigatória" }),
    status: z.string().optional().nullable(),
    school_id: z.any().transform(val => (val !== null && val !== undefined && val !== "" ? Number(val) : null)).optional().nullable(),
});

export const updateRegisterSchema = createRegisterSchema.partial();