import { z } from "zod";

export const createTeacherocupationSchema = z.object({
    teacher_id: z.number({ error: "O professor é obrigatório" }),
    groupconfig_id: z.number({ error: "A turma configurada é obrigatória" }),
    subject_id: z.number({ error: "A disciplina é obrigatória" }),
    year_id: z.number({ error: "O ano é obrigatório" }),
    school_id: z.number({ error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateTeacherocupationSchema = createTeacherocupationSchema.partial();