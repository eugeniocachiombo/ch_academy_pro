import { z } from "zod";

const requiredDateField = (requiredMsg: string, invalidMsg: string) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    z
      .string({
        required_error: requiredMsg,
        invalid_type_error: invalidMsg,
      })
      .trim()
      .min(1, requiredMsg)
      .refine((val) => !Number.isNaN(Date.parse(val)), {
        message: invalidMsg,
      })
  );

const yearBaseSchema = z.object({
  name: z
    .string({ required_error: "O nome é obrigatório" })
    .trim()
    .min(1, "O nome é obrigatório"),
  startdate: requiredDateField(
    "A data de início é obrigatória",
    "A data de início é inválida"
  ),
  enddate: requiredDateField(
    "A data de fim é obrigatória",
    "A data de fim é inválida"
  ),
  isCurrent: z.boolean().optional(),
  school_id: z
    .number({ required_error: "O school_id é obrigatório" })
    .optional()
    .nullable(),
});

const withDateRangeValidation = <T extends z.ZodTypeAny>(schema: T) =>
  schema.superRefine((data: any, ctx) => {
    if (data.startdate && data.enddate) {
      const start = new Date(data.startdate).getTime();
      const end = new Date(data.enddate).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["enddate"],
          message: "A data de fim deve ser igual ou posterior à data de início",
        });
      }
    }
  });

export const createYearSchema = withDateRangeValidation(yearBaseSchema);

export const updateYearSchema = withDateRangeValidation(
  yearBaseSchema.partial()
);