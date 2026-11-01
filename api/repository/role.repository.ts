import { BaseRepository } from "./base/base.repository.js";

class RoleRepository extends BaseRepository {
    constructor() {
        super("role");
    }
}

export const roleRepository = new RoleRepository();