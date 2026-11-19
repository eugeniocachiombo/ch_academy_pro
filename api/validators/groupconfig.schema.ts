import { z } from "zod";

const requiredId = (label: string) =>
  z.coerce
    .number({
      required_error: `${label} é obrigatório(a)`,
      invalid_type_error: `${label} inválido(a)`,
    })
    .int(`${label} inválido(a)`)
    .positive(`${label} é obrigatório(a)`);

export const groupconfigItemSchema = z.object({
  name: z
    .string({ required_error: "O nome é obrigatório" })
    .trim()
    .min(1, "O nome é obrigatório"),

  total_slots: z.coerce
    .number({
      required_error: "O total de vagas é obrigatório",
      invalid_type_error: "Informe um número válido",
    })
    .int("O número de vagas deve ser inteiro")
    .min(1, "A turma deve ter pelo menos 1 vaga"),

  group_id: requiredId("A turma"),
  year_id: requiredId("O ano letivo"),
  course_id: requiredId("O curso"),
  class_id: requiredId("A classe"),
  period_id: requiredId("O turno"),
  room_id: requiredId("A sala"),

  school_id: z.coerce.number().int().positive().nullable().optional(),
});

export const createGroupconfigSchema = groupconfigItemSchema;

export const createGroupconfigBatchSchema = z
  .array(groupconfigItemSchema)
  .min(1, "Adicione pelo menos uma configuração");

export const updateGroupconfigSchema = groupconfigItemSchema.partial();