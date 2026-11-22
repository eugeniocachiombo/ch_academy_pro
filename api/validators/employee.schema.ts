import { z } from "zod";
import { createPersonSchema, updatePersonSchema } from "./person.schema.js";

export const createEmployeeSchema = z.object({
    person: createPersonSchema,
    department_id: z.coerce.number().int().positive().nullable().optional(),
    position_id: z.coerce.number().int().positive().nullable().optional(),
    school_id: z.coerce.number().int().positive().nullable().optional(),
  });
  
  export const updateEmployeeSchema = z.object({
    person: updatePersonSchema.optional(),
    department_id: z.coerce.number().int().positive().nullable().optional(),
    position_id: z.coerce.number().int().positive().nullable().optional(),
    school_id: z.coerce.number().int().positive().nullable().optional(),
  });