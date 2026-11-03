import { z } from "zod";

export const createTeacherocupationSchema = z.object({
    teacher_id: z.number({ required_error: "O professor é obrigatório" }),
    groupconfig_id: z.number({ required_error: "A turma configurada é obrigatória" }),
    subject_id: z.number({ required_error: "A disciplina é obrigatória" }),
    year_id: z.number({ required_error: "O ano é obrigatório" }),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateTeacherocupationSchema = createTeacherocupationSchema.partial();