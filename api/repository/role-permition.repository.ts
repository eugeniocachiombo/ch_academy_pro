import { BaseRepository } from "./base/base.repository.js";

class RolePermitionRepository extends BaseRepository {
    constructor() {
        super("rolePermition");
    }
}

export const rolePermitionRepository = new RolePermitionRepository();