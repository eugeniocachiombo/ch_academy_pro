import { BaseRepository } from "./base/base.repository.js";

class UserRoleRepository extends BaseRepository {
    constructor() {
        super("userRole");
    }
}

export const userRoleRepository = new UserRoleRepository();