import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import bcrypt from 'bcrypt';

export const createUserSchema = z.object({
    name: z.string().transform(v => v === "" ? undefined : v).optional(),
    username: z.string()
        .min(3, "Nome de utilizador é obrigatório")
        .refine(async (username) => {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            });
            return !existingUser; 
        }, {
            message: "Este nome de utilizador já está em uso, escolha um outro"
        }),
    password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres"),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export const getUpdateUserSchema = (userId?: number | string) => z.object({
    name: z.string().transform(v => v === "" ? undefined : v).optional(),
    username: z.string()
        .min(3, "Nome de utilizador é obrigatório")
        .refine(async (username) => {
            const existingUser = await prisma.user.findUnique({
                where: { username }
            });
            if (!existingUser) return true;
            if (userId && existingUser.id === Number(userId)) return true;
            return false;
        }, {
            message: "Este nome de utilizador já está em uso, escolha um outro"
        }).optional(),
    status: z.enum(["ACTIVE", "BLOCKED"]).optional(),
    school_id: z.union([z.string(), z.number()]).optional()
});

export const updateSchema = getUpdateUserSchema();

export const getUpdatePasswordSchema = (userId: number) => z.object({
    current_password: z.string()
        .min(1, "A palavra-passe actual é obrigatória")
        .refine(async (currentPassword) => {
            const user = await prisma.user.findUnique({
                where: { id: Number(userId) }
            });
            if (!user) return false;
            return await bcrypt.compare(currentPassword, user.password);
        }, {
            message: "A palavra-passe actual está incorreta."
        }),
    password: z.string().min(6, "A nova palavra-passe deve ter pelo menos 6 caracteres"),
    password_confirmation: z.string().min(1, "A confirmação da palavra-passe é obrigatória")
}).refine((data) => data.password === data.password_confirmation, {
    message: "As palavra-passes não coincidem",
    path: ["password_confirmation"],
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateSchema>;