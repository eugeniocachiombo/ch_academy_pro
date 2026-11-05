import { z } from 'zod';

export const createClassSubjectSchema = z.object({
    subject_id: z.number(),
    class_id: z.number(),
    school_id: z.number().optional()
});

export const updateClassSubjectSchema = z.object({
    subject_id: z.number().optional(),
    class_id: z.number().optional(),
    school_id: z.number().optional()
});

export type CreateClassSubjectInput = z.infer<typeof createClassSubjectSchema>;
export type UpdateClassSubjectInput = z.infer<typeof updateClassSubjectSchema>;