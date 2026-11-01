import { z } from 'zod';

export const createUserRoleSchema = z.object({
    user_id: z.union([z.string(), z.number()]),
    role_id: z.union([z.string(), z.number()]),
    school_id: z.union([z.string(), z.number()]).optional()
});

export const updateUserRoleSchema = z.object({
    user_id: z.union([z.string(), z.number()]).optional(),
    role_id: z.union([z.string(), z.number()]).optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export type CreateUserRoleInput = z.infer<typeof createUserRoleSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;