import { BaseRepository } from "./base/base.repository.js";

class EmployeeRepository extends BaseRepository {
    constructor() {
        super("employee");
    }
}

export const employeeRepository = new EmployeeRepository();