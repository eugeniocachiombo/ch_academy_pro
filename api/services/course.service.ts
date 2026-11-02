import { BaseService } from './base.service.js';
import { courseRepository } from '../repository/course.repository.js';
import { createCourseSchema, updateCourseSchema } from '../validators/course.schema.js';

class CourseService extends BaseService {
    constructor() {
        super(
            courseRepository, 
            "course", 
            {
                create: createCourseSchema,
                update: updateCourseSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new CourseService();