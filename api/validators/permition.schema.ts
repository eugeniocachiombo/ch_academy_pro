import { z } from 'zod';

export const createPermitionSchema = z.object({
    name: z.string().min(2, "O nome da permissão é obrigatório"),
    description: z.string().optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export const updatePermitionSchema = z.object({
    name: z.string().min(2, "O nome da permissão é obrigatório").optional(),
    description: z.string().optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export type CreatePermitionInput = z.infer<typeof createPermitionSchema>;
export type UpdatePermitionInput = z.infer<typeof updatePermitionSchema>;