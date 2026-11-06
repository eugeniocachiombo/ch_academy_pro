import { z } from "zod";

export const createStudentSchema = z.object({
    user_id: z.number({ required_error: "O user_id é obrigatório" }),
    province_id: z.string().optional().nullable(),
    municipality_id: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    fathername: z.string().optional().nullable(),
    mothername: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    origin_school: z.string().optional().nullable(),
    municipalityId: z.number().optional().nullable(),
    provinceId: z.number().optional().nullable(),
    school_id: z.number().optional().nullable(),
});

export const updateStudentSchema = createStudentSchema.partial();