import { z } from "zod";

export const createProvinceSchema = z.object({
  name: z.string({ required_error: "O nome da província é obrigatório" }).min(1, "O nome da província é obrigatório"),
});

export const updateProvinceSchema = createProvinceSchema.partial();