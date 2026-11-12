import { BaseService } from './base.service.js';
import { studentparentRepository } from '../repository/studentparent.repository.js';
import { createStudentparentSchema, updateStudentparentSchema } from '../validators/studentparent.schema.js';

class StudentparentService extends BaseService {
    constructor() {
        super(
            studentparentRepository, 
            "studentparent", 
            {
                create: createStudentparentSchema,
                update: updateStudentparentSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new StudentparentService();