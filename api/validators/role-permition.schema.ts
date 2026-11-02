import { z } from 'zod';

export const createRolePermitionSchema = z.object({
    role_id: z.union([z.string(), z.number()]),
    permition_id: z.union([z.string(), z.number()]),
    school_id: z.union([z.string(), z.number()]).optional()
});

export const updateRolePermitionSchema = z.object({
    role_id: z.union([z.string(), z.number()]).optional(),
    permition_id: z.union([z.string(), z.number()]).optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export type CreateRolePermitionInput = z.infer<typeof createRolePermitionSchema>;
export type UpdateRolePermitionInput = z.infer<typeof updateRolePermitionSchema>;