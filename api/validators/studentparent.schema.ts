import { z } from "zod";

export const createStudentparentSchema = z.object({
    student_id: z.number({ required_error: "O student_id é obrigatório" }),
    parent_id: z.number({ required_error: "O parent_id é obrigatório" }),
    school_id: z.number().optional().nullable(),
});

export const updateStudentparentSchema = createStudentparentSchema.partial();