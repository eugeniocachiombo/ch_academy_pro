import { z } from "zod";

const isEmptyDate = (val: unknown): boolean => {
  if (val === null || val === undefined) return true;
  if (typeof val === "string" && val.trim() === "") return true;
  return false;
};

const isValidDateString = (val: unknown): boolean => {
  if (typeof val !== "string") return false;
  const trimmed = val.trim();
  if (!trimmed) return false;
  return !Number.isNaN(Date.parse(trimmed));
};

const yearBaseSchema = z.object({
  name: z
    .string({
      error: "O nome é obrigatório",
      required_error: "O nome é obrigatório",
      invalid_type_error: "O nome é inválido",
    })
    .trim()
    .min(1, "O nome é obrigatório"),
  startdate: z.any(),
  enddate: z.any(),
  isCurrent: z.boolean().optional(),
  school_id: z
    .number({
      error: "O school_id é inválido",
      required_error: "O school_id é obrigatório",
      invalid_type_error: "O school_id é inválido",
    })
    .optional()
    .nullable(),
});

const validateYearDates = (
  data: Record<string, any>,
  ctx: z.RefinementCtx,
  requireBoth: boolean
) => {
  const hasStartField = "startdate" in data;
  const hasEndField = "enddate" in data;

  let startValid = true;
  let endValid = true;

  if (requireBoth || hasStartField) {
    if (isEmptyDate(data.startdate)) {
      startValid = false;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startdate"],
        message: "A data de início é obrigatória",
      });
    } else if (!isValidDateString(data.startdate)) {
      startValid = false;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startdate"],
        message: "A data de início é inválida",
      });
    }
  }

  if (requireBoth || hasEndField) {
    if (isEmptyDate(data.enddate)) {
      endValid = false;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enddate"],
        message: "A data de fim é obrigatória",
      });
    } else if (!isValidDateString(data.enddate)) {
      endValid = false;
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enddate"],
        message: "A data de fim é inválida",
      });
    }
  }

  if (startValid && endValid && data.startdate && data.enddate) {
    const start = new Date(String(data.startdate).trim()).getTime();
    const end = new Date(String(data.enddate).trim()).getTime();
    if (!Number.isNaN(start) && !Number.isNaN(end) && end < start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["enddate"],
        message: "A data de fim deve ser igual ou posterior à data de início",
      });
    }
  }
};

export const createYearSchema = yearBaseSchema.superRefine((data, ctx) => {
  validateYearDates(data, ctx, true);
});

export const updateYearSchema = yearBaseSchema.partial().superRefine((data, ctx) => {
  validateYearDates(data, ctx, false);
});