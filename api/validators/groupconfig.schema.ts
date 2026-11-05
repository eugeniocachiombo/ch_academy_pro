import { z } from "zod";

const baseSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    group_id: z.number({ required_error: "A turma é obrigatória" }).nullable().refine(val => val !== null && val !== undefined, {
        message: "A turma é obrigatória"
    }),
    year_id: z.number({ required_error: "O ano é obrigatório" }).nullable().refine(val => val !== null && val !== undefined, {
        message: "O ano é obrigatório"
    }),
    course_id: z.number().optional().nullable(),
    class_id: z.number({ required_error: "A classe é obrigatória" }).nullable().refine(val => val !== null && val !== undefined, {
        message: "A classe é obrigatória"
    }),
    period_id: z.number({ required_error: "O Turno é obrigatório" }).nullable().refine(val => val !== null && val !== undefined, {
        message: "O Turno é obrigatório"
    }),
    room_id: z.number({ required_error: "A sala é obrigatória" }).nullable().refine(val => val !== null && val !== undefined, {
        message: "A sala é obrigatória"
    }),
    school_id: z.number().optional().nullable(),
});

export const createGroupconfigSchema = baseSchema;

export const updateGroupconfigSchema = baseSchema.partial();