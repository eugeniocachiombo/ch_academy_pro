import { BaseService } from './base.service.js';
import { studentRepository } from '../repository/student.repository.js';
import { createStudentSchema, updateStudentSchema } from '../validators/student.schema.js';

class StudentService extends BaseService {
    constructor() {
        super(
            studentRepository, 
            "student", 
            {
                create: createStudentSchema,
                update: updateStudentSchema
            }, 
            {
                tenant: 'mixed',
                include: { 
                    user: true, 
                    school: true,
                    province: true,
                    municipality: true
                }
            }
        );
    }
}

export default new StudentService();