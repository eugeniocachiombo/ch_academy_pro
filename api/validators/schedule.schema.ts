import { z } from "zod";

export const createScheduleSchema = z.object({
    groupconfig_id: z.number({ required_error: "A configuração da turma é obrigatória" }),
    subject_id: z.number({ required_error: "A disciplina é obrigatória" }),
    teacher_id: z.number({ required_error: "O professor é obrigatório" }),
    year_id: z.number({ required_error: "O ano letivo é obrigatório" }),
    day_of_week: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"], {
        required_error: "O dia da semana é obrigatório"
    }),
    start_time: z.string({ required_error: "A hora de início é obrigatória" }).min(1, "A hora de início é obrigatória"),
    end_time: z.string({ required_error: "A hora de término é obrigatória" }).min(1, "A hora de término é obrigatória"),
    school_id: z.number().optional().nullable(),
});

export const updateScheduleSchema = createScheduleSchema.partial();