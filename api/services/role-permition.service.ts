import { BaseService } from './base.service.js';
import { rolePermitionRepository } from '../repository/role-permition.repository.js';
import { createRolePermitionSchema, updateRolePermitionSchema } from '../validators/role-permition.schema.js';

class RolePermitionService extends BaseService {
    constructor() {
        super(
            rolePermitionRepository, 
            "rolePermition", 
            {
                create: createRolePermitionSchema,
                update: updateRolePermitionSchema
            }, 
            {
                tenant: 'mixed',
                include: { role: true, permition: true }
            }
        );
    }
}

export default new RolePermitionService();