import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repository/user.repository.js';
import { loginSchema, LoginInput } from '../validators/auth.schema.js';
import { CrudContext } from './base.service.js';

class AuthService {
    async login(data: unknown) {
        const { username, password } = loginSchema.parse(data) as LoginInput;

        const user = await userRepository.findByUsername(username);
        if (!user) {
            throw new Error("INVALID_CREDENTIALS");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("INVALID_CREDENTIALS");
        }

        if (user.status === "BLOCKED") {
            throw new Error("USER_BLOCKED");
        }

        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN;

        const token = jwt.sign(
            { 
                userId: user.id, 
                schoolId: user.school_id,
                username: user.username 
            },
            secret,
            { expiresIn: expiresIn as any }
        );

        const { password: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            token
        };
    }

    async getProfile(ctx: CrudContext, userId: string | number) {
        const id = Number(userId);
        const user = await userRepository.findFirst({
            where: { id, ...(ctx.schoolId && !ctx.isSuperAdmin && { school_id: ctx.schoolId }) }
        });

        if (!user) {
            throw new Error("NOT_FOUND");
        }

        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}

export default new AuthService();