import { z } from "zod";
import { createUserSchema, updateSchema } from "./user.schema.js";
import { createPersonSchema, updatePersonSchema } from "./person.schema.js";

export const createParentSchema = z.object({
    fullname: z.string().min(1, "O nome completo é obrigatório"),
    phone: z.string().min(1, "O telefone é obrigatório"),
    phonealt: z.string().optional().nullable(),
    ocupation: z.string().optional().nullable(),
    user_id: z.number().optional().nullable(),
    school_id: z.number().optional().nullable(),
    person: createPersonSchema.optional(),
    user: createUserSchema.optional(),
});

export const updateParentSchema = createParentSchema.partial().extend({
    person: updatePersonSchema.optional(),
    user: updateSchema.optional(),
});