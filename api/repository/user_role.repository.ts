import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createUserRoleSchema = z.object({
    user_id: z.number("O usuário é obrigatório"),
    role_id: z.number("A função é obrigatória")
});

export const updateUserRoleSchema = createUserRoleSchema.partial();

export type CreateUserRoleInput = z.infer<typeof createUserRoleSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

class UserRoleRepository extends Crud {
    constructor() {
        super("userRole", {
            create: createUserRoleSchema,
            update: updateUserRoleSchema
        });
    }

    async list() {
        return prisma.userRole.findMany({
            include: {role: true}
        });
    }
}

export const userRoleRepository = new UserRoleRepository();