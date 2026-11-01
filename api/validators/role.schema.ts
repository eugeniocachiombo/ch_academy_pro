import { z } from 'zod';

export const createRoleSchema = z.object({
    name: z.string().min(2, "O nome do papel é obrigatório"),
    description: z.string().optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export const updateRoleSchema = z.object({
    name: z.string().min(2, "O nome do papel é obrigatório").optional(),
    description: z.string().optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;