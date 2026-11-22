import { BaseRepository } from "./base/base.repository.js";

class DepartmentRepository extends BaseRepository {
    constructor() {
        super("department");
    }
}

export const departmentRepository = new DepartmentRepository();