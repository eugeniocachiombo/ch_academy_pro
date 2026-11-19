import { BaseService } from './base.service.js';
import { classSubjectRepository } from '../repository/class-subject.repository.js';
import { createClassSubjectSchema, updateClassSubjectSchema } from '../validators/class-subject.schema.js';

class ClassSubjectService extends BaseService {
    constructor() {
        super(
            classSubjectRepository,
            "classSubject",
            {
                create: createClassSubjectSchema,
                update: updateClassSubjectSchema
            },
            {
                tenant: 'mixed',
                include: {
                    subject: true,
                    class: true
                }
            }
        );
    }
}

export default new ClassSubjectService();