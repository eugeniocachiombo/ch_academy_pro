import { BaseService } from './base.service.js';
import { parentRepository } from '../repository/parent.repository.js';
import { createParentSchema, updateParentSchema } from '../validators/parent.schema.js';

class ParentService extends BaseService {
    constructor() {
        super(
            parentRepository, 
            "parent", 
            {
                create: createParentSchema,
                update: updateParentSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new ParentService();