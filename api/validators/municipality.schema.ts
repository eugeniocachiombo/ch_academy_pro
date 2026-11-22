import { z } from "zod";

export const createMunicipalitySchema = z.object({
  name: z.string({ required_error: "O nome do município é obrigatório" }).min(1, "O nome do município é obrigatório"),
  province_id: z.coerce.number({ required_error: "A província é obrigatória" }).int().positive(),
});

export const updateMunicipalitySchema = createMunicipalitySchema.partial();