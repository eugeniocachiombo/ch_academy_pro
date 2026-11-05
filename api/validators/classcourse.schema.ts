import { z } from 'zod';

export const createClasscourseSchema = z.object({
    course_id: z.number(),
    class_id: z.number(),
    school_id: z.number().optional()
});

export const updateClasscourseSchema = z.object({
    course_id: z.number().optional(),
    class_id: z.number().optional(),
    school_id: z.number().optional()
});

export type CreateClasscourseInput = z.infer<typeof createClasscourseSchema>;
export type UpdateClasscourseInput = z.infer<typeof updateClasscourseSchema>;