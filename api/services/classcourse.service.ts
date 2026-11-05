import { BaseService } from './base.service.js';
import { classcourseRepository } from '../repository/classcourse.repository.js';
import { createClasscourseSchema, updateClasscourseSchema } from '../validators/classcourse.schema.js';

class ClasscourseService extends BaseService {
    constructor() {
        super(
            classcourseRepository, 
            "classcourse", 
            {
                create: createClasscourseSchema,
                update: updateClasscourseSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new ClasscourseService();