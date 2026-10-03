import { z } from 'zod';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

export const createAcademicRoomSchema = z.object({
    name: z.string().min(2, "O nome da sala deve ter pelo menos 2 caracteres")
}).refine(async (data) => {
    const existing = await prisma.academicRoom.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe uma sala registada com este nome.",
    path: ["name"]
});

export const updateAcademicRoomSchema = z.object({
    name: z.string().min(2, "O nome da sala deve ter pelo menos 2 caracteres").optional()
}).refine(async (data) => {
    if (!data.name) return true;
    const existing = await prisma.academicRoom.findFirst({ where: { name: data.name } });
    return !existing;
}, {
    message: "Já existe uma sala registada com este nome.",
    path: ["name"]
});

export type CreateAcademicRoomInput = z.infer<typeof createAcademicRoomSchema>;
export type UpdateAcademicRoomInput = z.infer<typeof updateAcademicRoomSchema>;

class AcademicRoomRepository extends Crud {
    constructor() {
        super("academicRoom", {
            create: createAcademicRoomSchema,
            update: updateAcademicRoomSchema
        });
    }
}

export const academicRoomRepository = new AcademicRoomRepository();