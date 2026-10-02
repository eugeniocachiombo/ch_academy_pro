import { z } from 'zod';
import bcrypt from 'bcrypt';
import { Crud } from "./base/crud.repository.js";
import { prisma } from '../lib/prisma';

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
    password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres")
});

export const updateUserSchema = createUserSchema.partial();

export const loginUserSchema = z.object({
    username: z.string().min(1, "O nome de utilizador é obrigatório"),
    password: z.string().min(1, "A palavra-passe é obrigatória")
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;

class UserRepository extends Crud {
    constructor() {
        super("user", {
            create: createUserSchema,
            update: updateUserSchema
        });
    }

    async create(data: unknown) {

        const validatedData = await createUserSchema.parseAsync(data);
        const hashedPassword = await bcrypt.hash(
            validatedData.password,
            10
        );

        return await prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword
            }
        });
    }

    async update(id: string | number, data: unknown) {
        
        const validatedData = await updateUserSchema.parseAsync(data);
        const updateData = {
            ...validatedData
        };

        if (updateData.password) {
            updateData.password = await bcrypt.hash(
                updateData.password,
                10
            );
        }

        return await prisma.user.update({
            where: {
                id: Number(id)
            },
            data: updateData
        });
    }


   
    async login(data: unknown, customSchema?: z.ZodSchema) {
        const schema = customSchema || loginUserSchema;
        const { username, password } = schema.parse(data) as LoginUserInput;

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new Error("INVALID_CREDENTIALS");
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export const userRepository = new UserRepository();