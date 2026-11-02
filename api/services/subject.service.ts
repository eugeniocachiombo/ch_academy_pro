import { BaseService } from './base.service.js';
import { subjectRepository } from '../repository/subject.repository.js';
import { createSubjectSchema, updateSubjectSchema } from '../validators/subject.schema.js';

class SubjectService extends BaseService {
    constructor() {
        super(
            subjectRepository, 
            "subject", 
            {
                create: createSubjectSchema,
                update: updateSubjectSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new SubjectService();