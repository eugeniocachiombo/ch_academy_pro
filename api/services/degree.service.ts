import { BaseService } from './base.service.js';
import { degreeRepository } from '../repository/degree.repository.js';
import { createDegreeSchema, updateDegreeSchema } from '../validators/degree.schema.js';

class DegreeService extends BaseService {
    constructor() {
        super(
            degreeRepository, 
            "degree", 
            {
                create: createDegreeSchema,
                update: updateDegreeSchema
            }, 
            {
                tenant: 'mixed' 
            }
        );
    }
}

export default new DegreeService();