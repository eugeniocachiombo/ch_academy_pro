import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";

export const createPermitionSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 4 caracteres")
});

export const updatePermitionSchema = createPermitionSchema.partial();

export type CreatePermitionInput = z.infer<typeof createPermitionSchema>;
export type UpdatePermitionInput = z.infer<typeof updatePermitionSchema>;

class PermitionRepository extends Crud {
    constructor() {
        super("permition", {
            create: createPermitionSchema,
            update: updatePermitionSchema
        });
    }
}

export const permitionRepository = new PermitionRepository();