import { BaseService } from './base.service.js';
import { classRepository } from '../repository/class.repository.js';
import { createClassSchema, updateClassSchema } from '../validators/class.schema.js';

class ClassService extends BaseService {
    constructor() {
        super(
            classRepository, 
            "class", 
            {
                create: createClassSchema,
                update: updateClassSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new ClassService();