import { z } from "zod";

const classesIsentas = [
  "pré-iniciação",
  "iniciação",
  "1ª classe",
  "2ª classe",
  "3ª classe",
  "4ª classe",
  "5ª classe",
  "6ª classe",
  "7ª classe",
  "8ª classe",
  "9ª classe"
];

const baseSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }).min(1, "O nome é obrigatório"),
    className: z.string().optional(),
    group_id: z.number({ required_error: "A turma é obrigatória" }),
    year_id: z.number({ required_error: "O ano é obrigatório" }),
    course_id: z.number().optional().nullable(),
    class_id: z.number({ required_error: "A classe é obrigatória" }),
    period_id: z.number({ required_error: "O Turno é obrigatório" }),
    room_id: z.number({ required_error: "A sala é obrigatória" }),
    school_id: z.number().optional().nullable(),
});

export const createGroupconfigSchema = baseSchema.superRefine((data, ctx) => {
    if (data.className) {
        const normalizedClassName = data.className.trim().toLowerCase();
        const isExempt = classesIsentas.some(c => normalizedClassName.includes(c));

        if (!isExempt && (!data.course_id || data.course_id <= 0)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "O curso é obrigatório para esta classe.",
                path: ["course_id"],
            });
        }
    }
});

export const updateGroupconfigSchema = baseSchema.partial().superRefine((data, ctx) => {
    if (data.className) {
        const normalizedClassName = data.className.trim().toLowerCase();
        const isExempt = classesIsentas.some(c => normalizedClassName.includes(c));

        if (!isExempt && data.course_id !== undefined && data.course_id !== null && data.course_id <= 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "O curso é obrigatório para esta classe.",
                path: ["course_id"],
            });
        }
    }
});