import { z } from "zod";

export const createSchoolSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    registed_by: z.number().optional().nullable(),
    nif: z.string().optional().nullable(),
    alternative_phone: z.string().optional().nullable(),
    email: z.string().optional().nullable(),
    province_id: z.number().optional().nullable(),
    municipality_id: z.number().optional().nullable(),
    municipalityId: z.number().optional().nullable(),
    provinceId: z.number().optional().nullable(),
});

export const updateSchoolSchema = createSchoolSchema.partial();