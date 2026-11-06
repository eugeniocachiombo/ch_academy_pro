import { z } from "zod";

export const createPersonSchema = z.object({
  firstname: z.string({ error: "O primeiro nome é obrigatório" }).min(1, "O primeiro nome é obrigatório"),
  middlename: z.string().optional().nullable(),
  lastname: z.string({ error: "O último nome é obrigatório" }).min(1, "O último nome é obrigatório"),
  birthday: z.string({ error: "A data de nascimento é obrigatória" }).min(1, "A data de nascimento é obrigatória"),
  gender: z.string({ error: "O gênero é obrigatório" }).min(1, "O gênero é obrigatório"),
  bi_number: z.string({ error: "O número do BI é obrigatório" }).min(1, "O número do BI é obrigatório"),
  nif: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  alternative_phone: z.string().optional().nullable(),
  email: z.preprocess(
    (value) => (value === '' ? null : value),
    z.string().email("E-mail inválido").optional().nullable()
  ),
  province: z.string().optional().nullable(),
  municipality: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  house_number: z.string().optional().nullable(),
});

export const updatePersonSchema = createPersonSchema.partial();