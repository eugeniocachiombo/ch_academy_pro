import { z } from "zod";

export const createStudentPresenceSchema = z.object({
    date: z.coerce.date().optional().nullable(),
    groupconfig_id: z.number({ required_error: "O groupconfig_id é obrigatório" }),
    teacher_id: z.number({ required_error: "O teacher_id é obrigatório" }),
    subject_id: z.number({ required_error: "O subject_id é obrigatório" }),
    schedule_id: z.number().int().positive().optional().nullable(),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateStudentPresenceSchema = createStudentPresenceSchema.partial();