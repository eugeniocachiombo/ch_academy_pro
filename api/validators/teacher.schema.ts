import { z } from "zod";
import { createUserSchema, updateSchema } from "./user.schema.js";
import { createPersonSchema, updatePersonSchema } from "./person.schema.js";

export const createTeacherSchema = z.object({
    codenumber: z.string().optional().nullable(),
    degree_id: z.number({ error: "O grau académico é obrigatório" }),
    specialty: z.string().optional().nullable(),
    school_id: z.number({ error: "O school_id é obrigatório" }).optional().nullable(),
    person: createPersonSchema.optional(),
    user: createUserSchema.optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial().extend({
    person: updatePersonSchema.optional(),
    user: updateSchema.optional(),
});