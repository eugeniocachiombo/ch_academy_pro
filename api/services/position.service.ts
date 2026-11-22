import { BaseService } from "./base.service.js";
import { positionRepository } from "../repository/position.repository.js";
import { createPositionSchema, updatePositionSchema } from "../validators/position.schema.js";

class PositionService extends BaseService {
    constructor() {
        super(
            positionRepository,
            "position",
            {
                create: createPositionSchema,
                update: updatePositionSchema
            },
            {
                tenant: "mixed",
                include: {
                    department: true,
                    employees: true
                }
            }
        );
    }
}

export default new PositionService();