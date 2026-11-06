import { z } from "zod";
import { createUserSchema, updateSchema } from "./user.schema.js";
import { createPersonSchema, updatePersonSchema } from "./person.schema.js";

export const createStudentSchema = z.object({
  processnum: z.number().optional(),
  province_id: z.string().optional().nullable(),
  municipality_id: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  fathername: z.string().optional().nullable(),
  mothername: z.string().optional().nullable(),
  phone: z.string({ error: "O telefone é obrigatório" }).min(1, "O telefone é obrigatório"),
  origin_school: z.string().optional().nullable(),
  municipalityId: z.number().optional().nullable(),
  provinceId: z.number().optional().nullable(),
  school_id: z.number({ error: "O school_id é obrigatório" }).optional().nullable(),
  person: createPersonSchema.optional(),
  user: createUserSchema.optional(),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  person: updatePersonSchema.optional(),
  user: updateSchema.optional(),
});