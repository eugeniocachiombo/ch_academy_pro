import { BaseService } from './base.service.js';
import { roleRepository } from '../repository/role.repository.js';
import { createRoleSchema, updateRoleSchema } from '../validators/role.schema.js';

class RoleService extends BaseService {
    constructor() {
        super(
            roleRepository, 
            "role", 
            {
                create: createRoleSchema,
                update: updateRoleSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new RoleService();