import { BaseRepository } from "./base/base.repository.js";
import { prisma } from "../lib/prisma.js";

class UserRepository extends BaseRepository {
    constructor() {
        super("user");
    }

    async findByUsername(username: string) {
        return await prisma.user.findUnique({
            where: { username },
            include: { userRoles: { include: { role: true } } },
        });
    }
}

export const userRepository = new UserRepository();