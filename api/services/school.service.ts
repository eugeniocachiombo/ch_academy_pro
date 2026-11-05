import { BaseService } from './base.service.js';
import { schoolRepository } from '../repository/school.repository.js';
import { createSchoolSchema, updateSchoolSchema } from '../validators/school.schema.js';

class SchoolService extends BaseService {
    constructor() {
        super(
            schoolRepository, 
            "school", 
            {
                create: createSchoolSchema,
                update: updateSchoolSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new SchoolService();