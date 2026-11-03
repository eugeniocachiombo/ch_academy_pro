import { z } from "zod";

export const createRegisterSchema = z.object({
    registnum: z.number({ required_error: "O nº de registo é obrigatório" }),
    student_id: z.number({ required_error: "O aluno é obrigatório" }),
    groupconfig_id: z.number({ required_error: "A turma configurada é obrigatória" }),
    year_id: z.number({ required_error: "O ano é obrigatório" }),
    date: z.string().datetime({ required_error: "A data é obrigatória" }),
    status: z.string().optional().nullable(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateRegisterSchema = createRegisterSchema.partial();