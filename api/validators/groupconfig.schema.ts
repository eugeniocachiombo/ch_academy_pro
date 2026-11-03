import { z } from "zod";

export const createGroupconfigSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    year_id: z.number({ required_error: "O ano é obrigatório" }),
    course_id: z.number({ required_error: "O curso é obrigatório" }),
    class_id: z.number({ required_error: "A classe é obrigatória" }),
    period_id: z.number({ required_error: "O Turno é obrigatório" }),
    room_id: z.number({ required_error: "A sala é obrigatória" }),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateGroupconfigSchema = createGroupconfigSchema.partial();