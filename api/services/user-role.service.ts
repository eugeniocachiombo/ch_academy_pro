import { BaseService } from './base.service.js';
import { userRoleRepository } from '../repository/user-role.repository.js';
import { createUserRoleSchema, updateUserRoleSchema } from '../validators/user-role.schema.js';

class UserRoleService extends BaseService {
    constructor() {
        super(
            userRoleRepository, 
            "userRole", 
            {
                create: createUserRoleSchema,
                update: updateUserRoleSchema
            }, 
            {
                tenant: 'mixed' // school_id obrigatório
            }
        );
    }
}

export default new UserRoleService();