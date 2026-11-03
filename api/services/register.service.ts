import { BaseService } from './base.service.js';
import { registerRepository } from '../repository/register.repository.js';
import { createRegisterSchema, updateRegisterSchema } from '../validators/register.schema.js';

class RegisterService extends BaseService {
    constructor() {
        super(
            registerRepository, 
            "register", 
            {
                create: createRegisterSchema,
                update: updateRegisterSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new RegisterService();