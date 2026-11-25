import { z } from "zod";

export const presenceStatusEnum = z.enum(["PRESENT", "ABSENT", "JUSTIFICATED"]);

export const createStudentPresenceListSchema = z.object({
    student_presence_id: z.number({ required_error: "O student_presence_id é obrigatório" }),
    student_id: z.number({ required_error: "O student_id é obrigatório" }),
    status: presenceStatusEnum.default("PRESENT"),
    school_id: z.number({ required_error: "O school_id é obrigatório" }).optional().nullable(),
});

export const updateStudentPresenceListSchema = createStudentPresenceListSchema.partial();