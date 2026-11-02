import { BaseService } from './base.service.js';
import { permitionRepository } from '../repository/permition.repository.js';
import { createPermitionSchema, updatePermitionSchema } from '../validators/permition.schema.js';

class PermitionService extends BaseService {
    constructor() {
        super(
            permitionRepository, 
            "permition", 
            {
                create: createPermitionSchema,
                update: updatePermitionSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new PermitionService();