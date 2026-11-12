import { z } from "zod";

export const createParentSchema = z.object({
    fullname: z.string({ required_error: "O nome completo é obrigatório" }).min(1, "O nome completo é obrigatório"),
    phone: z.string({ required_error: "O telefone é obrigatório" }).min(1, "O telefone é obrigatório"),
    phonealt: z.string().optional().nullable(),
    ocupation: z.string().optional().nullable(),
    user_id: z.number({ required_error: "O user_id é obrigatório" }),
    school_id: z.number().optional().nullable(),
});

export const updateParentSchema = createParentSchema.partial();