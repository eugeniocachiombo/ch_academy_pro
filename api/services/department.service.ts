import { BaseService } from "./base.service.js";
import { departmentRepository } from "../repository/department.repository.js";
import { createDepartmentSchema, updateDepartmentSchema } from "../validators/department.schema.js";

class DepartmentService extends BaseService {
    constructor() {
        super(
            departmentRepository,
            "department",
            {
                create: createDepartmentSchema,
                update: updateDepartmentSchema
            },
            {
                tenant: "mixed",
                include: {
                    positions: true,
                    employees: true
                }
            }
        );
    }
}

export default new DepartmentService();