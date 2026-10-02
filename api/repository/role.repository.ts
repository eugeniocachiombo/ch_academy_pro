import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";

export const createRoleSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres")
});

export const updateRoleSchema = createRoleSchema.partial();

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

class RoleRepository extends Crud {
    constructor() {
        super("role", {
            create: createRoleSchema,
            update: updateRoleSchema
        });
    }
}

export const roleRepository = new RoleRepository();