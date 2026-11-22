import { BaseService } from "./base.service.js";
import { employeeRepository } from "../repository/employee.repository.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../validators/employee.schema.js";

class EmployeeService extends BaseService {
    constructor() {
        super(
            employeeRepository,
            "employee",
            {
                create: createEmployeeSchema,
                update: updateEmployeeSchema
            },
            {
                tenant: "mixed",
                include: {
                    person: true,
                    department: true,
                    position: true
                }
            }
        );
    }
}

export default new EmployeeService();