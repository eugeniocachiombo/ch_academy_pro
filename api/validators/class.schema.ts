import { z } from "zod";

export const createClassSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" })
});

export const updateClassSchema = createClassSchema.partial();