import { z } from "zod";

export const createRoomSchema = z.object({
    name: z.string({ required_error: "O nome é obrigatório" }),
    school_id: z.number({ required_error: "O school_id é obrigatório" })
});

export const updateRoomSchema = createRoomSchema.partial();