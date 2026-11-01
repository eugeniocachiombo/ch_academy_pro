import { z } from 'zod';

export const loginSchema = z.object({
    username: z.string().min(1, "O nome de utilizador é obrigatório"),
    password: z.string().min(1, "A palavra-passe é obrigatória")
});

export type LoginInput = z.infer<typeof loginSchema>;