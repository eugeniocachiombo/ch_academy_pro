import { z } from "zod";
import { createPersonSchema, updatePersonSchema } from "./person.schema.js";

const positionIdsSchema = z.array(z.coerce.number().int().positive()).optional().default([]);

export const createEmployeeSchema = z.object({
  person: createPersonSchema,
  department_id: z.coerce.number().int().positive().nullable().optional(),
  position_id: z.coerce.number().int().positive().nullable().optional(),
  position_ids: positionIdsSchema,
  school_id: z.coerce.number().int().positive().nullable().optional(),
});

export const updateEmployeeSchema = z.object({
  person: updatePersonSchema.optional(),
  department_id: z.coerce.number().int().positive().nullable().optional(),
  position_id: z.coerce.number().int().positive().nullable().optional(),
  position_ids: z.array(z.coerce.number().int().positive()).optional(),
  school_id: z.coerce.number().int().positive().nullable().optional(),
});